<template>
  <v-form v-model="valid" ref="form" lazy-validation>
    <v-layout row wrap>
      <v-flex xs12 md8 offset-md2>
        <v-text-field v-model="address" counter="52" :rules="addressRules" clearable required solo></v-text-field>
      </v-flex>
      <v-flex xs12 md6 offset-md2>
        <v-text-field
          placeholder="Amount"
          type="number"
          v-model.number="amount"
          min="0"
          :suffix="symbol"
          :rules="amountRules"
          required
          solo
        ></v-text-field>
      </v-flex>
      <v-flex xs12 md2 text-xs-right>
        <v-btn large :disabled="!valid" @click="send">Send</v-btn>
      </v-flex>
    </v-layout>
  </v-form>
</template>

<script>
import { isValidFctPublicAddress } from "factom";

export default {
  data() {
    return {
      address: "",
      amount: 0,
      valid: true,
      addressRules: [
        v => isValidFctPublicAddress(v) || "Invalid public FCT address"
      ]
    };
  },
  props: ["balances", "symbol"],
  computed: {
    totalBalance() {
      return this.balances.reduce((acc, val) => acc + val.balance, 0);
    },
    amountRules() {
      const totalBalance = this.totalBalance;
      return [
        amount =>
          (typeof amount === "number" && amount > 0) ||
          "Amount must be strictly positive",
        amount => amount <= totalBalance || "Not enough funds"
      ];
    }
  },
  methods: {
    send() {
      if (this.$refs.form.validate()) {
        // TODO
      }
    }
  }
};
</script>

<style scoped>
</style>
