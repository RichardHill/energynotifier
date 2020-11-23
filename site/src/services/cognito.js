import axios from "axios";

const cognito =  {
  updateUserEnergyValues: async function(lowerLimit, upperLimit, product_import, tariff_import, product_export, tariff_export ,accessToken) {
  
    const theUrl =
      "https://xrki6fd3d6.execute-api.eu-west-2.amazonaws.com/dev/set";

    const theBody = {
      upper_limit: upperLimit.toString(),
      lower_limit: lowerLimit.toString(),
      product_import,
      tariff_import,
      product_export,
      tariff_export,
      user_key: accessToken,
    };

    console.log("About to post the following to the end point -: " + JSON.stringify(theBody));
    
    //Now set up Axios to make the POST request.
    await axios.request({ method: 'POST', url: theUrl, data: JSON.stringify(theBody)});

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
