var AWS = require('aws-sdk');
import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';

export const getUsers: Handler = async (event: APIGatewayEvent, context: Context, cb: Callback) => {

    var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({ apiVersion: '2016-04-18' });

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
        var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
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

