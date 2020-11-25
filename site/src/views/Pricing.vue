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
          :value="tariff"
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
          :value="tariff"
          :key="index"
          >{{ tariff }}</option
        >
      </select>
    </div>
    <br />
    <br />
    <div>
      <p>
        <span
          >Please choose the pricing levels that you wish to be alerted about
          your Export Electrcitiy
        </span>
      </p>
      <ul>
        <li>
          <p>Export Upper Limit</p>
          <input v-model.number="export_upperLimit" type="number" />
        </li>
        <li>
          <p>Export Lower Limit</p>
          <input v-model.number="export_lowerLimit" type="number" />
        </li>
      </ul>
    </div>
    <div>
      <p>
        <span
          >Please choose the pricing levels that you wish to be alerted about
          your Import Electrcitiy
        </span>
      </p>
      <ul>
        <li>
          <p>Import Upper Limit</p>
          <input v-model.number="import_upperLimit" type="number" />
        </li>
        <li>
          <p>Import Lower Limit</p>
          <input v-model.number="import_lowerLimit" type="number" />
        </li>
      </ul>
    </div>
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

    const results = await cognito.getUserEnergyValues(
      this.$store.getters.accessToken
    );

    const upperPowerExportName = "custom:upper_power_export";
    const lowerPowerExportName = "custom:lower_power_export";
    const upperPowerImportName = "custom:upper_power_import";
    const lowerPowerImportName = "custom:lower_power_import";

    const exportProductName = "custom:product_export";
    const exportTariffName = "custom:tariff_export";

    const importProductName = "custom:product_import";
    const importTariffName = "custom:tariff_import";

    //Limits
    const upperPowerExportResult = results.data.find(
      (element) => element.Name === upperPowerExportName
    );
    this.export_upperLimit = upperPowerExportResult.Value;

    const lowerPowerExportResult = results.data.find(
      (element) => element.Name === lowerPowerExportName
    );
    this.export_lowerLimit = lowerPowerExportResult.Value;

    const upperPowerImportResult = results.data.find(
      (element) => element.Name === upperPowerImportName
    );
    this.import_upperLimit = upperPowerImportResult.Value;

    const lowerPowerImportResult = results.data.find(
      (element) => element.Name === lowerPowerImportName
    );
    this.import_lowerLimit = lowerPowerImportResult.Value;

    // Products
    const exportProductCode = results.data.find(
      (element) => element.Name === exportProductName
    );
    const importProductCode = results.data.find(
      (element) => element.Name === importProductName
    );

    // Tariffs
    const importTariffResult = results.data.find(
      (element) => element.Name === importTariffName
    );
    this.selected_import_tariff = importTariffResult.Value;

    const exportTariffResult = results.data.find(
      (element) => element.Name === exportTariffName
    );
    this.selected_export_tariff = exportTariffResult.Value;
  },
  data: function() {
    return {
      export_upperLimit: 0,
      export_lowerLimit: 0,
      import_upperLimit: 0,
      import_lowerLimit: 0,
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
        this.export_lowerLimit,
        this.export_upperLimit,
        this.import_lowerLimit,
        this.import_upperLimit,
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

          if (theCode) this.energy_tariffs_export.push(theCode);
        }
      });
    },
  },
};
</script>
