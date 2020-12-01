<template>
  <div class="small">
    <select v-model="selected_date" @change="this.onSelectedDateChanged">
      <option v-for="(date, index) in this.dates" :value="date" :key="index">{{
        date
      }}</option>
    </select>
    <line-chart :chart-data="chartData" :options="options"></line-chart>
  </div>
</template>

<script>
import LineChart from "./LineChart.js";
import powerData from "../services/powerData";

export default {
  name: "today",
  components: {
    LineChart,
  },
  data() {
    return {
      chartData: null,
      options: null,
      dates: [],
      selected_date: {},
    };
  },
  async mounted() {
    //Populate date selector.
    Date.prototype.addDays = function(days) {
      var date = new Date(this.valueOf());
      date.setDate(date.getDate() + days);
      return date;
    };

    var currentDate = new Date();
    var stopDate = currentDate.addDays(-5);

    while (currentDate >= stopDate) {
      this.dates.push(new Date(currentDate));
      currentDate = currentDate.addDays(-1);
    }

    //Get the data for today - EXTEND THIS TO COPE WITH THE USERS TARIFF/PRODUCT.
    const yesterday = new Date().addDays(-1);
    this.processAndDisplay(yesterday);
  },
  methods: {
    fillData(price, time, type) {
      this.options = {
        legend: {
          display: true,
        },
        title: {
          display: true,
          text: "Octopus Energy - " + type,
        },
        responsive: true,
        maintainAspectRatio: false,
      };

      this.chartData = {
        labels: time,
        datasets: [
          {
            label: "Price",
            backgroundColor: "#f87979",
            data: price,
          },
        ],
      };
    },
    async getPowerData(theDate) {
      const properMonth = ("0" + (theDate.getMonth() + 1)).slice(-2);
      let properDay = ("0" + theDate.getDate()).slice(-2);

      const formattedDate =
        theDate.getFullYear() + "-" + properMonth + "-" + properDay;

      const thePowerData = await powerData.getPower(
        formattedDate,
        this.$store.getters.idToken
      );
      return thePowerData;
    },
    async onSelectedDateChanged() {
      await this.processAndDisplay(this.selected_date);
    },
    async processAndDisplay(theDate) {
      const theData = await this.getPowerData(theDate);

      if (theData.data.output !== null) {
        const price = theData.data.output.L[0].M.data.L.map((element) => {
          return parseFloat(element.M.value_inc_vat.N);
        });

        const time = theData.data.output.L[0].M.data.L.map((element) => {
          const theDate = new Date(element.M.valid_from.S);
          const minutes =
            theDate.getMinutes().toString().length < 2
              ? theDate.getMinutes() + "0"
              : theDate.getMinutes();
          const properMonth = (parseInt(theDate.getMonth()) + 1).toString();
          return (
            theDate.getDate() +
            "/" +
            properMonth +
            "/" +
            theDate.getFullYear() +
            " - " +
            theDate.getHours() +
            "." +
            minutes
          );
        });

        const product_name = theData.data.output.L[0].M.product_name.S;
        const tariff_name = theData.data.output.L[0].M.tariff_name.S;
        const product_type = theData.data.output.L[0].M.product_type.S;

        const type =
          "Tariff " + product_name + " / " + tariff_name + " - " + product_type; //theData.data.
        this.fillData(price, time, type);
      }
    },
  },
};
</script>

<style>
.small {
  max-width: 2000px;
  margin: 20px auto;
}
</style>
