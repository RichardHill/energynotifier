import store from "../store";

export default {
  authenticate: function(provider) {
    var domain =
      "service-user-pool-domain-dev-com.auth.eu-west-2.amazoncognito.com"; //process.env.AWS_COGNITO_USER_POOL_DOMAIN;
    var clientId = "5vl9ro8i114m3oi4rvg2aiu5d6"; //process.env.AWS_COGNITO_CLIENT_ID;
    var type = "token";
    var scope = "aws.cognito.signin.user.admin+email+openid+phone+profile";

    var callback =
      window.location.protocol + "//" + window.location.host + "/callback";

    // Save the 'verification' value, so it can be verified later to prevent CSRF attacks
    var verification = generateVerification();
    store.commit("setVerification", verification);

    if (provider !== undefined) {
      // Go straight to the provider, skipping the hosted UI
      window.location.href =
        "https://" +
        domain +
        "/authorize?identity_provider=" +
        provider +
        "&response_type=" +
        type +
        "&client_id=" +
        clientId +
        "&redirect_uri=" +
        callback +
        "&state=" +
        verification +
        "&scope=" +
        scope;
    } else {
      // Use the hosted UI
      window.location.href =
        "https://" +
        domain +
        "/login?" +
        "client_id=" +
        clientId +
        "&response_type=" +
        type +
        "&scope=" +
        scope +
        "&redirect_uri=" +
        callback +
        "&state=" +
        verification;
    }
  },
};

// generateVerification creates a random string for including in the OAuth2
// request, which is then validated in the response.
function generateVerification() {
  var verification = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 32; i++) {
    verification += possible.charAt(
      Math.floor(Math.random() * possible.length)
    );
  }
  return verification;
}
