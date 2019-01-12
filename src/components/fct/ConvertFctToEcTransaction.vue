<template>
  <v-layout wrap>
    <v-flex text-xs-center xs12 my-4>
      <v-sheet class="white--text" color="primary" elevation="1">
        <h1>Convert Factoids to Entry Credits</h1>
      </v-sheet>
    </v-flex>
    <v-flex xs12>
      <v-form v-model="valid" ref="form" @submit="send" lazy-validation>
        <v-layout row wrap>
          <v-flex xs12 md8 offset-md2>
            <v-text-field
              v-model="outputAddress"
              label="Recipient EC address"
              counter="52"
              :rules="addressRules"
              clearable
              required
              solo
            ></v-text-field>
          </v-flex>
          <v-flex xs12 md6 offset-md2>
            <v-text-field
              placeholder="Amount"
              type="number"
              v-model.number="outputAmount"
              min="0"
              step="1"
              suffix="EC"
              :rules="amountRules"
              required
              solo
            ></v-text-field>
          </v-flex>
          <v-flex xs12 md2 text-xs-right>
            <v-btn color="primary" large :disabled="!valid" type="submit" :loading="sending">Convert
              <v-icon right>local_play</v-icon>
            </v-btn>
          </v-flex>
          <v-flex v-if="valid && fctCost" xs12 md8 offset-md2>
            <v-alert :value="true" type="info" outline>
              <strong>{{fctCost}} FCT</strong>
              will be converted to entry credits (rate: 1 FCT = {{rate.toLocaleString()}} EC).
            </v-alert>
          </v-flex>
          <v-flex v-if="errorMessage" xs12 md8 offset-md2>
            <v-alert :value="true" type="error" outline>{{errorMessage}}</v-alert>
          </v-flex>
          <v-flex xs12>
            <v-alert
              :value="transactionSentMessage"
              type="success"
              outline
            >{{transactionSentMessage}}</v-alert>
          </v-flex>
        </v-layout>
      </v-form>
    </v-flex>
  </v-layout>
</template>

<script>
import { isValidEcPublicAddress } from "factom";
import {
  buildTransaction,
  getFeeAdjustedTransaction
} from "./TransactionHelper";

const FACTOSHI_MULTIPLIER = 100000000;

export default {
  data() {
    return {
      outputAddress: "",
      outputAmount: 0,
      fctCost: 0,
      rate: 0,
      valid: true,
      errorMessage: "",
      transactionSentMessage: "",
      sending: false,
      addressRules: [
        v => isValidEcPublicAddress(v) || "Invalid public EC address"
      ]
    };
  },
  computed: {
    balances() {
      return this.$store.state.address.fctBalances;
    },
    totalBalance() {
      return Object.values(this.balances).reduce((acc, val) => acc + val, 0);
    },
    amountRules() {
      return [
        amount =>
          (Number.isInteger(amount) && amount > 0) ||
          "Amount must be strictly positive integer"
      ];
    },
    transactionProperties() {
      return [this.outputAmount, this.outputAddress];
    }
  },
  methods: {
    async send(e) {
      e.preventDefault();
      if (this.$refs.form.validate()) {
        try {
          this.transactionSentMessage = "";
          this.errorMessage = "";
          this.sending = true;
          const tx = await buildTransaction(
            this.$store,
            this.balances,
            this.outputAddress,
            this.outputAmount
          );
          const cli = this.$store.getters["factomd/cli"];
          const txId = await cli.sendTransaction(tx, { timeout: 10 });
          this.$store.dispatch("address/fetchFctBalances");
          this.$store.dispatch("address/fetchEcBalances");
          this.transactionSentMessage = `Transaction sent. ID: ${txId}`;
        } catch (e) {
          this.errorMessage = e.message;
        } finally {
          this.sending = false;
        }
      }
    }
  },
  watch: {
    async transactionProperties() {
      if (
        isValidEcPublicAddress(this.outputAddress) &&
        typeof this.outputAmount === "number"
      ) {
        const factomd = this.$store.getters["factomd/cli"];
        const ecRate = await factomd.getEntryCreditRate();

        const tx = getFeeAdjustedTransaction(
          this.balances,
          this.outputAddress,
          this.outputAmount * ecRate,
          ecRate
        );
        this.fctCost = tx.totalInputs / FACTOSHI_MULTIPLIER;
        this.rate = FACTOSHI_MULTIPLIER / ecRate;
      }
    }
  }
};
</script>

<style scoped>
</style>
