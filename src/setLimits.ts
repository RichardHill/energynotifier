import { CognitoIdentityServiceProvider} from "aws-sdk";
import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";
import { CustomAttributePayload } from "./customAttributePayload";

export const setLimits: Handler = async (
  event: APIGatewayEvent,
  context: Context,
  cb: Callback
) => {

  const upperPowerExportName = "custom:upper_power_export";
  const lowerPowerExportName = "custom:lower_power_export";

  const upperPowerImportName = "custom:upper_power_import";
  const lowerPowerImportName = "custom:lower_power_import";

  const product_import_name = 'custom:product_import';
  const tariff_import_name = 'custom:tariff_import';
  const product_export_name = 'custom:product_export';
  const tariff_export_name = 'custom:tariff_export';

  // Store the invcoming values
  const updateValues: CustomAttributePayload = new CustomAttributePayload(
    JSON.parse(event.body)
  );  

  console.log("The event.body is -:  " + event.body);
  console.log("The CustomAttributePayload is -: " + JSON.stringify(updateValues));

  var params = {
    AccessToken: updateValues.user_key,
    UserAttributes: [
      {
        Name: upperPowerExportName,
        Value: updateValues.upper_limit_export,
      },
      {
        Name: lowerPowerExportName,
        Value: updateValues.lower_limit_export,
      },
      {
        Name: upperPowerImportName,
        Value: updateValues.upper_limit_import,
      },
      {
        Name: lowerPowerImportName,
        Value: updateValues.lower_limit_import,
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
