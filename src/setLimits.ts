import { CognitoIdentityServiceProvider} from "aws-sdk";
import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";
import { CustomAttributePayload } from "./customAttributePayload";

export const setLimits: Handler = async (
  event: APIGatewayEvent,
  context: Context,
  cb: Callback
) => {

  const upper_power_price = 'custom:upper_power_price';
  const lower_power_price = 'custom:lower_power_price';
  const product_import_name = 'custom:product_import_name';
  const tariff_import_name = 'custom:tariff_import_name';
  const product_export_name = 'custom:product_export_name';
  const tariff_export_name = 'custom:tariff_export_name';

  // Store the invcoming values
  const updateValues: CustomAttributePayload = new CustomAttributePayload(
    JSON.parse(event.body)
  );  

  console.log("The object is -:  " + event.body);

  var params = {
    AccessToken: updateValues.user_key,
    UserAttributes: [
      {
        Name: upper_power_price,
        Value: updateValues.upper_limit,
      },
      {
        Name: lower_power_price,
        Value: updateValues.lower_limit,
      },
      {
        Name: product_import_name,
        Value: updateValues.product_import,
      },
      {
        Name: tariff_import_name,
        Value: updateValues.tariff_import,
      },
      {
        Name: product_export_name,
        Value: updateValues.product_export,
      },
      {
        Name: tariff_export_name,
        Value: updateValues.tariff_export,
      },
    ],
  };

    const cognitoidentityserviceprovider = new CognitoIdentityServiceProvider();
    const userDetails = await cognitoidentityserviceprovider.updateUserAttributes(params).promise(); 

    return {
        statusCode: 200,
        "headers": { 
            "Access-Control-Allow-Origin": "*",    
            "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
        },
        body: JSON.stringify(userDetails)
    }

};
