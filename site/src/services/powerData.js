import axios from "axios";

const powerData = {
  getPower: async function(selectedDate, accessToken) {
        const theUrl =
        'https://yy9i8lhab6.execute-api.eu-west-2.amazonaws.com/dev/get-power?date=' + selectedDate;    

        var http = axios.create({
        baseURL: theUrl,
        params: {
            AccessToken: accessToken
        }
        });

        return await http.get();
    }
}

export default powerData;