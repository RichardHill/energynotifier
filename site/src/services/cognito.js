import axios from "axios";

const cognito =  {
  updateUserEnergyValues: async function(export_lowerLimit, export_upperLimit, import_lowerLimit, import_upperLimit, product_import, tariff_import, product_export, tariff_export ,accessToken) {
  
    const theUrl =
      "https://yy9i8lhab6.execute-api.eu-west-2.amazonaws.com/dev/set";

    const theBody = {
      upper_limit_export: export_upperLimit.toString(),
      lower_limit_export: export_lowerLimit.toString(),
      upper_limit_import: import_upperLimit.toString(),
      lower_limit_import: import_lowerLimit.toString(),
      product_import,
      tariff_import,
      product_export,
      tariff_export,
      user_key: accessToken,
    };
    
    //Now set up Axios to make the POST request.
    await axios.request({ method: 'POST', url: theUrl, data: JSON.stringify(theBody)});

  },
  getUserEnergyValues: async (accessToken) => {

      const theUrl =
      'https://yy9i8lhab6.execute-api.eu-west-2.amazonaws.com/dev/get?AccessToken=' + accessToken;    
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


/* test object

{
      "upper_limit_export": "10",
      "lower_limit_export": "1",
      "upper_limit_import": "10",
      "lower_limit_import": "1",
      "product_import" : "fjeriofrejio",
      "tariff_import" : "hijhiuhiu",
      "product_export" : "huihiuhiu",
      "tariff_export":  "huihuih",
      "user_key": "eyJraWQiOiJzaWdkOHpESzlDTDBiV3dKQ2xxcTl0XC93UXlKbUw5MXRuNkI0ZzRNNCtyWT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI3MDRhNTQ0NC03YzMxLTQ5NDAtOTI1ZS00N2VkOGYwNDQ5NTgiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6ImF3cy5jb2duaXRvLnNpZ25pbi51c2VyLmFkbWluIHBob25lIG9wZW5pZCBwcm9maWxlIGVtYWlsIiwiYXV0aF90aW1lIjoxNjA2MzQyODAyLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuZXUtd2VzdC0yLmFtYXpvbmF3cy5jb21cL2V1LXdlc3QtMl84MUJwbmJYVTIiLCJleHAiOjE2MDYzNDY0MDIsImlhdCI6MTYwNjM0MjgwMiwidmVyc2lvbiI6MiwianRpIjoiZTY2OWI2MzEtOTU4MS00OWUxLWI5ZDEtZjQ2OTg5NmQ1ODBkIiwiY2xpZW50X2lkIjoiMW41dm9xcnAzMDFqcDNjbTlhNnZibjdkMHQiLCJ1c2VybmFtZSI6IjcwNGE1NDQ0LTdjMzEtNDk0MC05MjVlLTQ3ZWQ4ZjA0NDk1OCJ9.YjjCs54TxvG8UWP3YLMrcnAsuPyTXOahXRGHw7Q_z42-hrpu9XghRWz3zdfECBBDGYpPSb9kXqJu9LnfTYxIs5ssaTgtdHYuCycSIGRhnq5SMszKv0P1YVN3PS6C5Fd8QM-YywETg7dkGWyMuUhR-FRnWSOybMstimXFyFR8rYhZXRpeXwwSEOB0ti6F1nsfxhtrq05O7s5xp1HNh2mHb-EpJYBSOZY7kKrQDYX2dNJ5quZcXYIRi53rBJCRdPRVfd6vWcLsdpzlzqwvItgpbihpWdm_LJL6LmkDXUUMD02HxOGb5YDnwa-Ve7VD-330r2jh-GMXH0ueGf3P_-EcmQ",
}


*/
