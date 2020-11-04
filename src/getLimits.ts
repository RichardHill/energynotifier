import { CognitoIdentityServiceProvider} from "aws-sdk";
import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";
import { GetUserRequest } from "aws-sdk/clients/cognitoidentityserviceprovider";

export const getLimits: Handler = async (
  event: APIGatewayEvent,
  context: Context,
  cb: Callback
) => {
  
    const accessToken = event.queryStringParameters['AccessToken'];

    var params : GetUserRequest = {
      AccessToken : accessToken
    };

   const cognitoidentityserviceprovider = new CognitoIdentityServiceProvider();
   const result = await cognitoidentityserviceprovider.getUser(params).promise();

   const customResult = result.UserAttributes.filter(element => element.Name.startsWith("custom"));

   return {
        statusCode: 200,
        "headers": { 
            "Access-Control-Allow-Origin": "*" ,
            "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
        },
        body: JSON.stringify(customResult)
    }
};


