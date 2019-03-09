<template>
  <v-layout wrap>
    <v-flex text-xs-center xs12 my-4>
      <v-sheet class="white--text" color="primary" elevation="1">
        <h1>Send Factoids</h1>
      </v-sheet>
    </v-flex>
    <v-flex xs12>
      <v-form v-model="valid" ref="form" @submit.prevent="confirmTransaction" lazy-validation>
        <v-layout row wrap align-baseline>
          <v-flex xs12 md8 offset-md2>
            <v-text-field
              v-model="outputAddress"
              label="Recipient FCT address"
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
              suffix="FCT"
              :rules="amountRules"
              required
              solo
            ></v-text-field>
          </v-flex>
          <v-flex xs12 md2 text-xs-right>
            <v-btn color="primary" large :disabled="!valid" type="submit" :loading="sending">Send
              <v-icon right>send</v-icon>
            </v-btn>
          </v-flex>
          <v-flex v-if="valid && outputAddress && fee" xs12 md8 offset-md2>
            <v-alert :value="true" type="info" outline>
              An additional transaction fee of
              <strong>{{fee.toLocaleString(undefined, {maximumFractionDigits:8})}} FCT</strong> will be deducted.
            </v-alert>
          </v-flex>
          <v-flex v-if="errorMessage" xs12 md8 offset-md2>
            <v-alert :value="true" type="error" outline dismissible>{{errorMessage}}</v-alert>
          </v-flex>
          <v-flex xs12>
            <v-alert
              :value="transactionSentMessage"
              type="success"
              outline
              dismissible
            >{{transactionSentMessage}}</v-alert>
          </v-flex>
        </v-layout>
      </v-form>
    </v-flex>
    <ConfirmBasicTransactionDialog
      ref="confirmTransactionDialog"
      :address="outputAddress"
      :amount="outputAmount"
      :fee="fee"
      @confirmed="send"
    ></ConfirmBasicTransactionDialog>
  </v-layout>
</template>

<script>
import { isValidPublicFctAddress } from "factom";
import {
  buildTransaction,
  getFeeAdjustedTransaction
} from "./TransactionHelper";
import ConfirmBasicTransactionDialog from "./CreateBasicTransaction/ConfirmBasicTransactionDialog";

const FACTOSHI_MULTIPLIER = 100000000;

export default {
  components: { ConfirmBasicTransactionDialog },
  data() {
    return {
      outputAddress: "",
      outputAmount: 0,
      fee: 0,
      valid: true,
      errorMessage: "",
      transactionSentMessage: "",
      sending: false,
      addressRules: [
        v => isValidPublicFctAddress(v) || "Invalid public FCT address"
      ]
    };
  },
  computed: {
    isAddressOk() {
      return this.addressRules.every(
        f => typeof f(this.outputAddress) !== "string"
      );
    },
    isAmountsOk() {
      return this.amountRules.every(
        f => typeof f(this.outputAmount) !== "string"
      );
    },
    factoshiOutputAmount() {
      return this.outputAmount * FACTOSHI_MULTIPLIER;
    },
    balances() {
      return this.$store.state.address.fctBalances;
    },
    totalBalance() {
      return Object.values(this.balances).reduce((acc, val) => acc + val, 0);
    },
    transactionProperties() {
      return [this.outputAmount, this.outputAddress];
    },
    amountRules() {
      const totalBalance = this.totalBalance;
      const selfAddressBalance = this.balances[this.outputAddress] || 0;
      return [
        amount =>
          (typeof amount === "number" && amount > 0) ||
          "Amount must be strictly positive",
        function(amount) {
          if (selfAddressBalance) {
            return (
              amount * FACTOSHI_MULTIPLIER <=
                totalBalance - selfAddressBalance ||
              "Not enough funds available"
            );
          } else {
            return (
              amount * FACTOSHI_MULTIPLIER <= totalBalance ||
              "Not enough funds available"
            );
          }
        }
      ];
    }
  },
  methods: {
    async confirmTransaction() {
      this.transactionSentMessage = "";
      if (this.$refs.form.validate()) {
        this.$refs.confirmTransactionDialog.show();
      }
    },
    async send() {
      try {
        this.errorMessage = "";
        this.sending = true;
        const tx = await buildTransaction(
          this.$store,
          this.balances,
          this.outputAddress,
          this.factoshiOutputAmount
        );
        const cli = this.$store.getters["factomd/cli"];
        const txId = await cli.sendTransaction(tx, { timeout: 1 });
        this.$store.dispatch("address/fetchFctBalances");
        this.$store.dispatch("address/fetchEcBalances");
        this.transactionSentMessage = `Transaction sent. ID: ${txId}`;
        this.$refs.form.reset();
      } catch (e) {
        this.errorMessage = e.message;
      } finally {
        this.sending = false;
      }
    }
  },
  watch: {
    async transactionProperties() {

      // Unfortunately the value of `valid` is not up to date when reaching this point
      // so we have to re-compute the validity of inputs manually.
      if (this.isAddressOk && this.isAmountsOk) {
        const factomd = this.$store.getters["factomd/cli"];
        const ecRate = await factomd.getEntryCreditRate();

        const tx = getFeeAdjustedTransaction(
          this.balances,
          this.outputAddress,
          this.factoshiOutputAmount,
          ecRate
        );

        this.fee = tx.feesPaid / FACTOSHI_MULTIPLIER;
      }
    }
  }
};
</script>

<style scoped>
</style>
