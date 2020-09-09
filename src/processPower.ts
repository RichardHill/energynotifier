var AWS = require('aws-sdk');
import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';

import { DynamoDB } from 'aws-sdk';
import { DailyPowerReading, PowerReading } from '../daily_power_reading';
import axios, { AxiosResponse } from 'axios';

export const processPower: Handler = async (event: APIGatewayEvent, context: Context, cb: Callback) => {

  // Call the dynamo table and get the last row that was added to it.
  // Create DynamoDB service object

  const dynamodbRecordIndex = new Date().toJSON().slice(0, 10).replace(/-/g, '').toString();
  console.log("processPower is going to try and retrieve a record stating with -: " + dynamodbRecordIndex);

  var ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

  try {
    var params = {
      Key: {
        "date_id": { "N": dynamodbRecordIndex }
      },
      TableName: 'energyNotifier-dev',
    };

    const result = await ddb.getItem(params).promise();

    if (Object.keys(result).length === 0) {

      console.log("We do not have any power data for todays date.... keep checking the end point..");
      const apiCallResult: boolean = await callOctopusAPI();

      if (apiCallResult === false) {

        // We didn't get any data. Lets sleep for a minute then call ourselves....
        setTimeout(() => {
          var params = {
            FunctionName: 'energyNotifier-dev-checkPower',
            InvocationType: 'Event',
            Payload: ''
          };

          const lambda = new AWS.Lambda();
          return new Promise(function (resolve, reject) {
            lambda.invoke(params, function (err, data) {
              if (err) {
                reject(err)
              } else {
                resolve(data)
              }
            })
          });

        }, 60000);
      }

    } else {
      console.log("We have already processed power data and will alert users....");
    }
  } catch (error) {
    console.error(error);
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless Webpack (Typescript) v1.0! Your function executed successfully!',
      input: event,
    }),
  };

  cb(null, response);
}


const callOctopusAPI = async () => {

  const dynamo = new DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

  //const octopusURL = "https://api.octopus.energy/v1/electricity-meter-points/2000056839362/meters/19L3278730/consumption/";
  //const octopusAPISecret = 'sk_live_Yuc0gi5WwZh9wdONaMnxBfAp:';

  //https://api.octopus.energy/v1/products/AGILE-18-02-21/electricity-tariffs/E-1R-AGILE-18-02-21-F/standard-unit-rates/?period_from=2020-09-06T23:30&period_to=2020-09-07T23:00

  const product = 'AGILE-18-02-21';
  const tariff_type = 'electricity-tariffs';
  const tariff_name = 'E-1R-AGILE-18-02-21-F';
  const rate = 'standard-unit-rates';
  const apiURL = 'https://api.octopus.energy/v1/products/';

  //Set up the time range.
  var currentDate = new Date();
  let tomorrow = new Date(new Date().setDate(currentDate.getDate() + 1));
  const periodFrom = 'period_from=' + new Date().toISOString().split('T')[0] + 'T23:00:00Z';
  const periodTo = 'period_to=' + tomorrow.toISOString().split('T')[0] + 'T23:00:00Z'

  const octopusURL = apiURL + product + '/' + tariff_type + '/' + tariff_name + '/' + rate + '/?' + periodFrom + '&' + periodTo;
  const octopusAPISecret = 'sk_live_Yuc0gi5WwZh9wdONaMnxBfAp:';

  //1. Get some readings.
  console.log("Calling the Octopus API with -: " + octopusURL);
  const apiResults: AxiosResponse = await axios.get(octopusURL, {
    auth: {
      username: octopusAPISecret,
      password: octopusAPISecret
    }
  });

  let currentHigh: PowerReading;
  let currentLow: PowerReading;

  //Process the API response.
  if (apiResults.data) {

    let runningHigh = 0;
    let runningLow = 100;
    let runningAvg = 0;

    const powerResultsArr = apiResults.data.results;

    //Check that the data we are getting is for tomorrows date. Not todays.
    //Get the first element
    const firstElement = apiResults.data.results[0].valid_from;
    var tomorrowsDate = new Date(new Date().setDate(currentDate.getDate() + 1)).toJSON().slice(0, 10).replace(/-/g, '-'); //new Date().toJSON().slice(0, 10).replace(/-/g, '-');

    if (firstElement.indexOf(tomorrowsDate) === -1) {
      console.log("----- We have failed to find data for tomorrow to process... -----");
      return false; // Returning false will signal to call the lambda again....
    }

    powerResultsArr.forEach(element => {
      //1. See if we have a running high
      if (element.value_exc_vat > runningHigh) {

        currentHigh = {
          value: element.value_exc_vat,
          start: element.valid_from,
          end: element.valid_to,
        }

        runningHigh = element.value_exc_vat;
      }

      //2. See if we have a new low.
      if (element.value_exc_vat < runningLow) {
        currentLow = {
          value: element.value_exc_vat,
          start: element.valid_from,
          end: element.valid_to
        }
      }

      //3. Accumulate the average.
      runningAvg += element.value_exc_vat;

      //Store the item in our array.
      //powerDetails.powerIntervals.push({ consumption: element.consumption, start: element.interval_start, end: element.interval_end } as PowerPriceInterval);

    });

    //Update the final properties.
    const powerDetails: DailyPowerReading = {
      dayHigh: currentHigh,
      dayLow: currentLow,
      dayAverage: runningAvg / powerResultsArr.length
    }

    var params = {
      TableName: 'energyNotifier-dev',
      Item: {
        "date_id": parseInt(new Date().toJSON().slice(0, 10).replace(/-/g, '').toString()),
        "date": new Date().toJSON().slice(0, 10).replace(/-/g, '/'),
        "dayHigh": {
          "price": powerDetails.dayHigh.value,
          "start": powerDetails.dayHigh.start,
          "end": powerDetails.dayHigh.end
        },
        "dayLow": {
          "price": powerDetails.dayLow.value,
          "start": powerDetails.dayLow.start,
          "end": powerDetails.dayLow.end
        },
        "dayAverage": powerDetails.dayAverage.toString()
      },
    };

    //Store this into Dynamo.
    var docClient = new AWS.DynamoDB.DocumentClient();

    try {
      await docClient.put(params).promise();
      return true;
    }
    catch (err) {
      console.log("Failure", err.message);
      return false;
    }

    return true;
  };
}


/// Logging calls
// console.log("First result is -: " + JSON.stringify(apiResults.data.results[0]));
// console.log("Todays date = " + tomorrowsDate.toString());
// console.log("The first element is -: " + firstElement.toString());
//console.log("Processing the array.... -: " + JSON.stringify(element));


 // Use AWS Pinpoint to send an SMS -: 
  // var pinpoint = new AWS.Pinpoint();

  // var pinPointParams = {
  //   //ApplicationId must match the ID of the application you created in AWS Mobile Hub
  //   ApplicationId: "794497917d5d4d5e8e3b8e3c8aa73516",
  //   MessageRequest: {
  //     Addresses: {
  //       ["07971963698"]: {
  //         ChannelType: "SMS",
  //       },
  //     },
  //     MessageConfiguration: {
  //       SMSMessage: {
  //         Body: "Energy Notifier. Todays Energy. High = " + powerDetails.dayHigh.price.toString() + " Low = " + powerDetails.dayLow.price.toString(),
  //         MessageType: "TRANSACTIONAL",
  //         SenderId: "PowerNotifier",
  //       }
  //     },
  //   }
  // };

  // // Send the SMS
  // pinpoint.sendMessages(pinPointParams, function (err, data) {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     console.log("Great Success");

  //   }
  // });

  //}