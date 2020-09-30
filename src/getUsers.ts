var AWS = require("aws-sdk");
import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";

export const getUsers: Handler = async (
  event: APIGatewayEvent,
  context: Context,
  cb: Callback
) => {
  const accessToken = JSON.parse(event.body);

  var params = {
    AccessToken: accessToken.token,
  };

  return new Promise((resolve, reject) => {
    //AWS.config.update({ region: USER_POOL_REGION, 'accessKeyId': AWS_ACCESS_KEY_ID, 'secretAccessKey': AWS_SECRET_KEY });
    var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
    cognitoidentityserviceprovider.getUser(params, (err, data) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        console.log("data", data);
        resolve(data);
      }
    });
  });
};
