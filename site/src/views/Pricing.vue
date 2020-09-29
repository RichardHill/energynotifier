<template>
  <div>
    <h1>Energy Pricing</h1>
    <p>Please enter the prices that you wish to be notified about.</p>
    <ul>
      <li>
        <p>Upper Limit</p>
        <input type="number" />
      </li>
      <li>
        <p>Lower Limit</p>
        <input type="number" />
      </li>
    </ul>
    <button>Update</button>
  </div>
</template>

<script>
export default {
  name: "subscription",
};
</script>
