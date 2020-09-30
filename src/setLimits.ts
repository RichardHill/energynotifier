var AWS = require("aws-sdk");
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

  return new Promise((resolve, reject) => {
    const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
    cognitoidentityserviceprovider.updateUserAttributes(params, function (
      err,
      data
    ) {
      if (err) console.log(err, err.stack);
      // an error occurred
      else console.log(data); // successful response
    });
  });
};
