import { CognitoIdentityServiceProvider} from "aws-sdk";
import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";

export const getUsers: Handler = async (
  event: APIGatewayEvent,
  context: Context,
  cb: Callback
) => {
  const accessToken = JSON.parse(event.body);

  // var params = {
  //   AccessToken: accessToken.token,
  // };

  var params = {
    AccessToken: `eyJraWQiOiJENk01eG1Fc1YxZTA1YmxCZlU0OXE0cUJIbGZpM0s3Y29rcEpCVWdlcERzPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiIyODg3ZTNlOC1iYjcwLTRkYTAtOTA4Mi1hNzYxYjYwZmI2NGQiLCJldmVudF9pZCI6ImM3MTVmZmM1LTc3MGUtNDg4Ni1hMTcyLTJiM2Q4Mjc2OWMwZiIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4gcGhvbmUgb3BlbmlkIHByb2ZpbGUgZW1haWwiLCJhdXRoX3RpbWUiOjE2MDMzOTk5NDksImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5ldS13ZXN0LTIuYW1hem9uYXdzLmNvbVwvZXUtd2VzdC0yX2hKTzlNUE53VCIsImV4cCI6MTYwMzQwMzU0OSwiaWF0IjoxNjAzMzk5OTQ5LCJ2ZXJzaW9uIjoyLCJqdGkiOiI1MGQ5MjllYS04M2QzLTRkOWUtOWZmNS0zNjU0Mjc2N2EwZmEiLCJjbGllbnRfaWQiOiI3YjVtYXRxMG92cjE4Z2dzam90M2tldHI0OSIsInVzZXJuYW1lIjoiMjg4N2UzZTgtYmI3MC00ZGEwLTkwODItYTc2MWI2MGZiNjRkIn0.JTLDSpDyDoLMRjQ7xc7WgYWC0z7HUMQvi1QfBzkx7HJFfORTmx6QGCctgIoOF7RILSLyZmZ2BnQIkAaau3_5YgjdIjjQsQcW1kSi6gXJsod7SBuGDKr9e4PMfl-DNIRQMrektj3XfxJc-j9aHh2-lfxXClOwBXEWWk8sq3_-8TdUAgvQqD9QIC0rZ-ASyJCuYqbQ38J30ysGwFzFuRn42N1IL5Xg-Sc-qeYb3MiuaeP8UrAlNl-ItMLUSaGpxMQqsYwUVm_5GYdw4enM5Pp8ih7ogd1myS6UVbDCZ890NIQJEReIbk2rvKyfawBqBQgbenW6IdBfMLpGNzazHy219A,eyJraWQiOiJENk01eG1Fc1YxZTA1YmxCZlU0OXE0cUJIbGZpM0s3Y29rcEpCVWdlcERzPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiIyODg3ZTNlOC1iYjcwLTRkYTAtOTA4Mi1hNzYxYjYwZmI2NGQiLCJldmVudF9pZCI6ImM3MTVmZmM1LTc3MGUtNDg4Ni1hMTcyLTJiM2Q4Mjc2OWMwZiIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4gcGhvbmUgb3BlbmlkIHByb2ZpbGUgZW1haWwiLCJhdXRoX3RpbWUiOjE2MDMzOTk5NDksImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5ldS13ZXN0LTIuYW1hem9uYXdzLmNvbVwvZXUtd2VzdC0yX2hKTzlNUE53VCIsImV4cCI6MTYwMzQwMzU0OSwiaWF0IjoxNjAzMzk5OTQ5LCJ2ZXJzaW9uIjoyLCJqdGkiOiI1MGQ5MjllYS04M2QzLTRkOWUtOWZmNS0zNjU0Mjc2N2EwZmEiLCJjbGllbnRfaWQiOiI3YjVtYXRxMG92cjE4Z2dzam90M2tldHI0OSIsInVzZXJuYW1lIjoiMjg4N2UzZTgtYmI3MC00ZGEwLTkwODItYTc2MWI2MGZiNjRkIn0.JTLDSpDyDoLMRjQ7xc7WgYWC0z7HUMQvi1QfBzkx7HJFfORTmx6QGCctgIoOF7RILSLyZmZ2BnQIkAaau3_5YgjdIjjQsQcW1kSi6gXJsod7SBuGDKr9e4PMfl-DNIRQMrektj3XfxJc-j9aHh2-lfxXClOwBXEWWk8sq3_-8TdUAgvQqD9QIC0rZ-ASyJCuYqbQ38J30ysGwFzFuRn42N1IL5Xg-Sc-qeYb3MiuaeP8UrAlNl-ItMLUSaGpxMQqsYwUVm_5GYdw4enM5Pp8ih7ogd1myS6UVbDCZ890NIQJEReIbk2rvKyfawBqBQgbenW6IdBfMLpGNzazHy219A`
  };


  return new Promise((resolve, reject) => {
    //AWS.config.update({ region: USER_POOL_REGION, 'accessKeyId': AWS_ACCESS_KEY_ID, 'secretAccessKey': AWS_SECRET_KEY });
    var cognitoidentityserviceprovider = new CognitoIdentityServiceProvider();
    cognitoidentityserviceprovider.getUser(params, (err, data) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        console.log("data", data);
        resolve();
      }
    });
  });
};
