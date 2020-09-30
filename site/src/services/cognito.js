import store from "../store";
import axios from "axios";

export default {
  updateUserEnergyValues: function(lowerLimit, upperLimit) {
    //First get the user
    const theUserToken = this.$store.getters.accessToken;

    const thePostURL =
      "https://puupx6cgqa.execute-api.eu-west-2.amazonaws.com/dev";

    const theBody = {
      upper_limit: upperLimit,
      lower_limit: lowerLimit,
      user_key: theUserToken,
    };

    //Now set up Axios to make the POST request.
    var http = axios.create({
      baseURL: thePostURL,
      data: theBody,
    });

    http
      .post("/update")
      .then((response) => {
        this.response = response;
      })
      .catch((err) => {
        this.response = err;
      });
  },
  getUserEnergyValues: function() {},
};
