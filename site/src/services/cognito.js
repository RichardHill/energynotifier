import axios from "axios";

const cognito =  {
  updateUserEnergyValues: async function(lowerLimit, upperLimit, accessToken) {
  
    const theUrl =
      "https://xrki6fd3d6.execute-api.eu-west-2.amazonaws.com/dev/set";

    const theBody = {
      upper_limit: upperLimit.toString(),
      lower_limit: lowerLimit.toString(),
      user_key: accessToken,
    };

    //Now set up Axios to make the POST request.
    axios.request({ method: 'POST', url: theUrl, data: JSON.stringify(theBody)});

  },
  getUserEnergyValues: async (accessToken) => {

      const theUrl =
      'https://xrki6fd3d6.execute-api.eu-west-2.amazonaws.com/dev/get?AccessToken=' + accessToken;    
      var http = axios.create({
      baseURL: theUrl,
      params: {
        AccessToken: accessToken
      }
    });

    return await http.get();

  }
 
};

export default cognito;
