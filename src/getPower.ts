import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
import { DynamoDB} from "aws-sdk";


export const getPower: Handler = async (event: APIGatewayEvent, context: Context, cb: Callback) => {


    // Get the date that the user has requested.
    const powerDate = event.queryStringParameters['date'];

    //Strip out the '/'
    const databaseQueryString = powerDate.split('-').join('');

    console.log("The databaseQueryString is -: " + databaseQueryString);

    // Query the database for data on that day.
    var dynamodb = new DynamoDB();

    let dbResult = null;
    let tariffData = null;

    try {
        var params = {
            Key: {
             "date_id": {"N": databaseQueryString}, 
            }, 
            TableName: 'energyNotifier-dev',
        };

        dbResult = await dynamodb.getItem(params).promise();

        console.log(JSON.stringify(dbResult));

        tariffData = dbResult.Item.processed_tariff_data.M.products;

    } catch (error) {
        console.error(error);
    }

    // Return it.
    const response = {
        statusCode: 200,
        "headers": { 
            "Access-Control-Allow-Origin": "*",    
            "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
        },
        body: JSON.stringify({
        message: 'getPower function executed successfully!',
        input: event,
        output: tariffData
        }),
    };

    cb(null, response);

};