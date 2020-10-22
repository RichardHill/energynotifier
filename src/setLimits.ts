import { CognitoIdentityServiceProvider} from "aws-sdk";
import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";
import { CustomAttributePayload } from "./customAttributePayload";

export const setLimits: Handler = async (
  event: APIGatewayEvent,
  context: Context,
  cb: Callback
) => {
  // Store the invcoming values
  const updateValues: CustomAttributePayload = new CustomAttributePayload(
    JSON.parse(event.body)
  );

  var params = {
    AccessToken: updateValues.user_key,
    UserAttributes: [
      {
        Name: "custom:upper_power_price",
        Value: updateValues.upper_limit,
      },
      {
        Name: "custom:lower_power_price",
        Value: updateValues.lower_limit,
      },
    ],
  };


    const cognitoidentityserviceprovider = new CognitoIdentityServiceProvider();
    const userDetails = await cognitoidentityserviceprovider.updateUserAttributes(params).promise(); 
    
    return {
        statusCode: 200,
        body: JSON.stringify(userDetails)
    }

};
