<template>
  <div>
    <h1>Energy Pricing</h1>
    <p>Please enter the prices that you wish to be notified about.</p>
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
    <button v-on:click="update">Update</button>
  </div>
</template>

<script>
import cognito from "../services/cognito";

export default {
  name: "subscription",
  mounted: async function() {
    const results = await cognito.getUserEnergyValues(
      this.$store.getters.accessToken
    );

    this.upperLimit = results.data[1].Value;
    this.lowerLimit = results.data[0].Value;
  },
  data: function() {
    return {
      upperLimit: 0,
      lowerLimit: 0,
    };
  },
  methods: {
    update: async function() {
      const accessToken = this.$store.getters.accessToken;
      await cognito.updateUserEnergyValues(
        this.lowerLimit,
        this.upperLimit,
        accessToken
      );
    },
  },
};
</script>
