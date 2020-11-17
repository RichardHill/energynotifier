import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
import { CognitoIdentityServiceProvider,DynamoDB, SES, SNS, SSM} from "aws-sdk";
import { DailyPowerReading, PowerPriceInterval, PowerReading } from '../daily_power_reading';
import axios, { AxiosResponse } from 'axios';
import { PowerProcessingResult } from './powerProcessingResult';

export const processPower: Handler = async (event: APIGatewayEvent, context: Context, cb: Callback) => {

  try {
    
    // Get todays data.
    const powerData = await callOctopusAPI();

    // Who needs to be notified.
    const usersToNotify = await processUsers(powerData);

    // Inform the users.
    await informUsers(usersToNotify, powerData);

  } catch (error) {
    console.error(error);
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'processPower function executed successfully!',
      input: event,
    }),
  };

  cb(null, response);
}

const callOctopusAPI = async () => {

  const dynamo = new DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

  const product = 'AGILE-18-02-21';
  const tariff_type = 'electricity-tariffs';
  const tariff_name = 'E-1R-AGILE-18-02-21-F';
  const rate = 'standard-unit-rates';
  const apiURL = 'https://api.octopus.energy/v1/products/';
  const SSM_API_KEY_VALUE = 'octopus_api_key';

  //Set up the time range.
  var currentDate = new Date();
  let tomorrow = new Date(new Date().setDate(currentDate.getDate() + 1));
  const periodFrom = 'period_from=' + new Date().toISOString().split('T')[0] + 'T23:00:00Z';
  const periodTo = 'period_to=' + tomorrow.toISOString().split('T')[0] + 'T23:00:00Z'

  const octopusURL = apiURL + product + '/' + tariff_type + '/' + tariff_name + '/' + rate + '/?' + periodFrom + '&' + periodTo;

  //Get the API Key from the parameter store.
  const ssm = new SSM();
  const ssm_params = { Name: SSM_API_KEY_VALUE, WithDecryption: true }
  const octopusAPISecret = await ssm.getParameter(ssm_params).promise();

  //1. Get some readings.
  const apiResults: AxiosResponse = await axios.get(octopusURL, {
    auth: {
      username: octopusAPISecret.Parameter.Value,
      password: octopusAPISecret.Parameter.Value
    }
  });

  let currentHigh: PowerReading;
  let currentLow: PowerReading;

  if (apiResults.data) {

    let runningHigh = 0;
    let runningLow = 100;
    let runningAvg = 0;
    let fullRecords = [];

    const powerResultsArr = apiResults.data.results;

    //Check that the data we are getting is for tomorrows date. Not todays.
    if (apiResults.data.results.length === 0)
      return null;

    const firstElement = apiResults.data.results[0].valid_from;

    var tomorrowsDate = new Date(new Date().setDate(currentDate.getDate() + 1)).toJSON().slice(0, 10).replace(/-/g, '-');

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
      fullRecords.push(element);

    });

    //Update the final properties.
    const powerDetails: DailyPowerReading = {
      dayHigh: currentHigh,
      dayLow: currentLow,
      dayAverage: runningAvg / powerResultsArr.length,
      powerIntervals: fullRecords
    }

    const currentDateTime = new Date();

    const theRecord = {
        "date_id": parseInt(new Date().toJSON().slice(0, 10).replace(/-/g, '').toString()),
        "date": new Date().toJSON().slice(0, 10).replace(/-/g, '/'),
        "timeOfHarvest":  currentDateTime.toUTCString(),
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
        "dayAverage": powerDetails.dayAverage.toString(),
        "recordArray": fullRecords
      };

    var params = {
      TableName: 'energyNotifier-dev',
      Item: theRecord
    };

    //Store this into Dynamo.
    var docClient = new DynamoDB.DocumentClient();

    try {
      await docClient.put(params).promise();
      return theRecord;
    }
    catch (err) {
      console.log("Failure when trying to store data into the database", err.message);
      return null;
    }
  };
}

const processUsers = async (todaysRecord : any) => {

  if (todaysRecord === null) {
    console.log("----- NO POWER DATA ------")
  }
    // Get the customer values
    let resultsArray = [];

    const userInformation = {
      UserPoolId: 'eu-west-2_hJO9MPNwT',
      AttributesToGet: ['name','custom:upper_power_price', 'custom:lower_power_price', 'phone_number', 'email'],
    };

    const cognitoidentityserviceprovider = new CognitoIdentityServiceProvider();
    const userDetails = await cognitoidentityserviceprovider.listUsers(userInformation).promise(); 

    console.log("The repsonse from Cognito is -:  " + JSON.stringify(userDetails));
    [...userDetails.Users].forEach(element => {

      console.log("The user details are -: " + JSON.stringify(element));

      const filteredResult = element.Attributes.filter(element => element.Name.startsWith("custom"));

      //User Prices
        const userUpperPrice = parseInt(filteredResult[0].Value);
        const userLowerPrice = parseInt(filteredResult[1].Value);

      //Todays Prices
      console.log("Todays Record is -: " + JSON.stringify(todaysRecord));

        const todaysUpper = parseInt(todaysRecord.dayHigh.price);
        const todaysLower = parseInt(todaysRecord.dayLow.price);

      // Are we close to the user upper price?
      let upperTrigger : boolean = false;
      let lowerTrigger : boolean = false;

      if(todaysUpper >= userUpperPrice) {
        upperTrigger = true;
      }
      
      if (todaysLower <= userLowerPrice) {
        lowerTrigger = true;
      }
    
      resultsArray.push(new PowerProcessingResult(upperTrigger, lowerTrigger, element));

    });

    console.log("Return this array =: " + JSON.stringify(resultsArray));
    
  return resultsArray;
};

const informUsers = async (users, powerData) => {

  console.log("The power data is -: " + JSON.stringify(powerData));

  try {
      users.forEach(async user => {

        console.log("The user data is -: " + JSON.stringify(user));

        if (user.upperLimitTrigger || user.lowerLimitTrigger) {

          let message = 'Hi, ' + user.theUser.Name;

          if (user.upperLimitTrigger) {
            message += " between " + new Date(powerData.dayHigh.start).toLocaleString() + " and " +  new Date(powerData.dayHigh.end).toLocaleString() + " you will be charged " + powerData.dayHigh.price + " pence to use electricity";
          }

          if (user.lowerLimitTrigger) {
            if (user.upperLimitTrigger) message += " and ";
            message += " between " + new Date(powerData.dayLow.start).toLocaleString() + " and " + new Date(powerData.dayLow.end).toLocaleString() + " you will be cahrged " + powerData.dayLow.price + " pence to use electricity";
          }
        
          const phone_number = user.theUser.phone_number;
          await informViaText(phone_number, message);
        }
      });
  }
  catch (e) {
    console.log("There was an error when trying to inform the users. -: " + e);
  }
}


const informViaText = async (phone_number, message) => {
  // Create publish parameters
  var params = {
    Message: message, /* required */
    MessageStructure: "string", 
    PhoneNumber: phone_number,
  };

  var sns = new SNS({apiVersion: '2010-03-31'});
  console.log("Publishing the following text message -: " + message + " to " + phone_number);

  try {
    let data = await sns.publish({
      Message: message,
      MessageAttributes: {
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional'
        },
        'AWS.SNS.SMS.SenderID': {
          DataType: 'String',
          StringValue: 'nrgnotifier'
        },
      },
      PhoneNumber: phone_number
    }).promise();

    console.log("Sent message to", phone_number);
    console.log("The data is -: " + JSON.stringify(data));
    return data;

  } catch (err) {
    console.log("Sending failed", err);
    throw err;
  }
}


const getUsers = async () => {

  var cognitoidentityserviceprovider = new CognitoIdentityServiceProvider({ apiVersion: '2016-04-18' });

  const USER_POOL_ID = 'eu-west-2_u3t7HUjtu';

  var params = {
    UserPoolId: USER_POOL_ID,
    AttributesToGet: [
      'email',
      'name',
      'phone_number'
    ],
  };

  return new Promise((resolve, reject) => {
    //AWS.config.update({ region: USER_POOL_REGION, 'accessKeyId': AWS_ACCESS_KEY_ID, 'secretAccessKey': AWS_SECRET_KEY });
    var cognitoidentityserviceprovider = new CognitoIdentityServiceProvider();
    cognitoidentityserviceprovider.listUsers(params, (err, data) => {
      if (err) {
        console.log(err);
        reject(err)
      }
      else {
        console.log("data", data);
        resolve(data)
      }
    });
  });
}

const informViaEmail = async (email_address) => {

  var ses = new SES({ region: 'us-west-2' });

  var params = {
    Destination: {
      ToAddresses: [email_address]
    },
    Message: {
      Body: {
        Text: {
          Data: "Test"
        }
      },
      Subject: {
        Data: "Test Email"
      }
    },
    Source: "richardmatthewhill@hotmail.com"
  };


  ses.sendEmail(params, function (err, data) {
    //callback(null, { err: err, data: data });
    if (err) {
      console.log(err);
      //context.fail(err);
    } else {

      console.log(data);
      //context.succeed(event);
    }
  });
}

  //const octopusURL = "https://api.octopus.energy/v1/electricity-meter-points/2000056839362/meters/19L3278730/consumption/";
  //const octopusAPISecret = 'sk_live_Yuc0gi5WwZh9wdONaMnxBfAp:';
  //https://api.octopus.energy/v1/products/AGILE-18-02-21/electricity-tariffs/E-1R-AGILE-18-02-21-F/standard-unit-rates/?period_from=2020-09-06T23:30&period_to=2020-09-07T23:00

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

  //const dynamodbRecordIndex = new Date().toJSON().slice(0, 10).replace(/-/g, '').toString();
  //console.log("processPower is going to try and retrieve a record stating with -: " + dynamodbRecordIndex);
  // var ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
  //   var params = {
  //   Key: {
  //     "date_id": { "N": dynamodbRecordIndex }
  //   },
  //   TableName: 'energyNotifier-dev',
  // };
  // let todaysRecord = await ddb.getItem(params).promise();
  // if (Object.keys(todaysRecord).length === 0) {
  //    todaysRecord = await callOctopusAPI();
  // } 