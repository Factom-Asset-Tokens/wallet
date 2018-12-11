<template>
  <div>
    <v-layout row wrap>
      <v-flex xs12 md8 offset-md2>
        <v-text-field
          placeholder="Recipient address"
          v-model="address"
          :rules="[validateOutputAddress]"
          solo
        ></v-text-field>
      </v-flex>
      <v-flex xs12 md6 offset-md2>
        <v-text-field
          placeholder="Amount"
          type="number"
          v-model.number="amount"
          min="0"
          :suffix="symbol"
          :error-messages="validateOutputAmount(amount)"
          solo
        ></v-text-field>
      </v-flex>
      <v-flex xs12 md2 text-xs-right>
        <v-btn large>Send</v-btn>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
const { isValidFctPublicAddress } = require("factom");

export default {
  data() {
    return {
      address: null,
      amount: 0
    };
  },
  props: ["balances", "symbol"],
  computed: {
    totalBalance() {
      return this.balances.reduce((acc, val) => acc + val.balance, 0);
    }
  },
  methods: {
    validateOutputAddress(address) {
      return isValidFctPublicAddress(address) || "Invalid public FCT address";
    },
    validateOutputAmount(amount) {
      const result = [];
      if (typeof amount !== "number" || amount < 0) {
        result.push("Amount must be a positive number");
      }
      if (amount > this.totalBalance) {
        result.push("Not enough funds");
      }
      return result;
    }
  }
};
</script>

<style scoped>
</style>
