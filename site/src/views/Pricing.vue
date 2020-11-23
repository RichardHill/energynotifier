<template>
  <div>
    <h1>Energy Settings</h1>
    <br />
    <div>
      <p>
        <span> Please select your Electrcitiy </span><strong>Import</strong
        ><span> Product from the list...</span>
      </p>
      <select
        v-if="this.energy_products.length > 0"
        v-model="selected_import_product"
        @change="getImportTariffs"
      >
        <option
          v-for="(product, index) in this.energy_products"
          :value="product"
          :key="index"
          >{{ product.full_name }}</option
        >
      </select>
    </div>
    <div style="margin-left:30px;">
      <br />
      <p>
        <span> - Please select your Electrcitiy </span><strong>Import</strong
        ><span> Tariff from the list...</span>
      </p>
      <select v-model="selected_import_tariff">
        <option> Please select a tariff </option>
        <option
          v-for="(tariff, index) in this.energy_tariffs_import"
          :value="selected_import_tariff"
          :key="index"
          >{{ tariff }}</option
        >
      </select>
    </div>
    <br />
    <div>
      <p>
        <span>Please select your Electrcitiy </span><strong>Export</strong
        ><span> Tariff from the list...</span>
      </p>
      <select v-model="selected_export_product" @change="getExportTariffs">
        <option
          v-for="(product, index) in this.energy_products"
          :value="product"
          :key="index"
          >{{ product.full_name }}</option
        >
      </select>
    </div>
    <div style="margin-left:30px;">
      <br />
      <p>
        <span> - Please select your Electrcitiy </span><strong>Import</strong
        ><span> Tariff from the list...</span>
      </p>
      <select v-model="selected_export_tariff">
        <option> Please select a tariff </option>
        <option
          v-for="(tariff, index) in this.energy_tariffs_export"
          :value="selected_export_tariff"
          :key="index"
          >{{ tariff }}</option
        >
      </select>
    </div>
    <br />
    <br />
    <p>
      <span
        >Please choose the pricing levels that you wish to be alerted about your
        Electrcitiy
      </span>
    </p>
    <ul>
      <li>
        <p>Upper Limit</p>
        <input v-model.number="upperLimit" type="number" />
      </li>
      <li>
        <p>Lower Limit</p>
        <input v-model.number="lowerLimit" type="number" />
      </li>
    </ul>
    <br />
    <button v-on:click="update">Update</button>
  </div>
</template>

<script>
import cognito from "../services/cognito";
import axios from "axios";

export default {
  name: "subscription",
  mounted: async function() {
    const results = await cognito.getUserEnergyValues(
      this.$store.getters.accessToken
    );

    const upperLimitName = "custom:upper_power_price";
    const lowerLimitName = "custom:lower_power_price";

    const exportProductName = "custom:product_export_name";
    const exportTariffName = "custom:tariff_export_name";

    const importProductName = "custom:product_import_name";
    const importTariffName = "custom:tariff_import_name";

    const upperResult = results.data.find((element) => {
      if (element.Name === upperLimitName) {
        return element;
      }
    });

    this.upperLimit = upperResult.Value;

    const lowerResult = results.data.find((element) => {
      if (element.Name === lowerLimitName) return element;
    });

    this.lowerLimit = lowerResult.Value;

    // Products
    const exportProductCode = results.data.find((element) => {
      if (element.Name === exportProductName) return element;
    });

    const importProductCode = results.data.find((element) => {
      if (element.Name === importProductName) return element;
    });

    // Tariffs
    const importTariffResult = results.data.find((element) => {
      if (element.Name === importTariffName) return element;
    });
    this.selected_import_tariff = importTariffResult.Value;

    const exportTariffResult = results.data.find((element) => {
      if (element.Name === exportTariffName) return element;
    });
    this.selected_export_tariff = exportTariffResult.Value;

    var http = axios.create({
      baseURL: "https://api.octopus.energy/v1/products",
      headers: {
        Authorization: this.$store.getters.idToken,
      },
    });

    await http
      .post()
      .then((response) => {
        this.energy_products = response.data.results;

        this.selected_export_product = this.energy_products.find(
          (element) => element.code === exportProductCode.Value
        );

        this.selected_import_product = this.energy_products.find(
          (element) => element.code === importProductCode.Value
        );
      })
      .catch((err) => {
        console.log(
          "There was an error calling Authorisation -: " + JSON.stringify(err)
        );
        this.response = err;
      });

    await this.getImportTariffs();
    await this.getExportTariffs();
  },
  data: function() {
    return {
      upperLimit: 0,
      lowerLimit: 0,
      energy_products: [],
      energy_tariffs_import: [],
      energy_tariffs_export: [],
      selected_import_product: {},
      selected_import_tariff: {},
      selected_export_product: {},
      selected_export_tariff: {},
    };
  },
  methods: {
    update: async function() {
      const accessToken = this.$store.getters.accessToken;
      await cognito.updateUserEnergyValues(
        this.lowerLimit,
        this.upperLimit,
        this.selected_import_product.code,
        this.selected_import_tariff,
        this.selected_export_product.code,
        this.selected_export_tariff,
        accessToken
      );
    },
    getImportTariffs: async function() {
      //Clear an import tariffs we may have.
      this.selected_import_tariff = null;
      this.energy_tariffs_import = [];

      var http = axios.create({
        baseURL:
          "https://api.octopus.energy/v1/products/" +
          this.selected_import_product.code,
      });

      await http.post().then((response) => {
        for (const property in response.data
          .single_register_electricity_tariffs) {
          const theCode =
            response.data.single_register_electricity_tariffs[property]
              .direct_debit_monthly.code;

          if (theCode) this.energy_tariffs_import.push(theCode);
        }
      });
    },
    getExportTariffs: async function() {
      //Clear an import tariffs we may have.
      this.selected_export_tariff = null;
      this.energy_tariffs_export = [];

      var http = axios.create({
        baseURL:
          "https://api.octopus.energy/v1/products/" +
          this.selected_export_product.code,
      });

      await http.post().then((response) => {
        for (const property in response.data
          .single_register_electricity_tariffs) {
          const theCode =
            response.data.single_register_electricity_tariffs[property]
              .direct_debit_monthly.code;

          console.log("The code is -: " + theCode);

          if (theCode) this.energy_tariffs_export.push(theCode);
        }
      });
    },
  },
};
</script>
