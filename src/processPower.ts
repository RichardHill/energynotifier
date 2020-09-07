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
      const apiCallResult = callOctopusAPI();

      if (Object.keys(apiCallResult).length === 0) {

        // We didn't get any data. Lets sleep for a minute then call ourselves....
        setTimeout(() => {
          var params = {
            FunctionName: 'checkPower',
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
      console.log("We have processed power data and will alert users....");
    }
  } catch (error) {
    console.error(error);
  }

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

  const octopusURL = "https://api.octopus.energy/v1/electricity-meter-points/2000056839362/meters/19L3278730/consumption/";
  const octopusAPISecret = 'sk_live_Yuc0gi5WwZh9wdONaMnxBfAp:';

  //1. Get some readings.
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

    powerResultsArr.forEach(element => {

      //1. See if we have a running high
      if (element.consumption > runningHigh) {

        currentHigh = {
          price: element.consumption,
          start: element.interval_start,
          end: element.interval_end
        }

        runningHigh = element.consumption;
      }

      //2. See if we have a new low.
      if (element.consumption < runningLow) {
        currentLow = {
          price: element.consumption,
          start: element.interval_start,
          end: element.interval_end
        }
      }

      //3. Accumulate the average.
      runningAvg += element.consumption;

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
          "price": powerDetails.dayHigh.price,
          "start": powerDetails.dayHigh.start,
          "end": powerDetails.dayHigh.end
        },
        "dayLow": {
          "price": powerDetails.dayLow.price,
          "start": powerDetails.dayLow.start,
          "end": powerDetails.dayLow.end
        },
        "dayAverage": powerDetails.dayAverage.toString()
      }
    };

    //Store this into Dynamo.
    var docClient = new AWS.DynamoDB.DocumentClient();

    try {
      return await docClient.put(params).promise;
    }
    catch (err) {
      console.log("Failure", err.message);
    }
  };
}