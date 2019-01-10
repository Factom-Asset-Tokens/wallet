<template>
  <v-layout wrap>
    <v-flex text-xs-center xs12 my-4>
      <v-sheet class="white--text" color="primary" elevation="1">
        <h1>Send Factoids</h1>
      </v-sheet>
    </v-flex>
    <v-flex xs12>
      <v-form v-model="valid" ref="form" @submit="send" lazy-validation>
        <v-layout row wrap>
          <v-flex xs12 md8 offset-md2>
            <v-text-field
              v-model="address"
              label="Recipient address"
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
              v-model.number="amount"
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
          <v-flex v-if="valid && fee" xs12 md8 offset-md2>
            <v-alert :value="true" type="info" outline>
              An additional transaction fee of
              <strong>{{fee.toLocaleString(undefined, {maximumFractionDigits:8})}} FCT</strong> will be deducted.
            </v-alert>
          </v-flex>
          <v-flex xs12>
            <v-alert
              :value="transactionSentMessage"
              type="success"
              outline
            >{{transactionSentMessage}}</v-alert>
          </v-flex>
        </v-layout>
        <v-snackbar v-model="snackError" color="error" :timeout="5000">
          {{ snackErrorMessage }}
          <v-btn dark flat @click="snackError = false">Close</v-btn>
        </v-snackbar>
      </v-form>
    </v-flex>
  </v-layout>
</template>

<script>
import Promise from "bluebird";
import { isValidFctPublicAddress, Transaction } from "factom";

const FACTOSHI_MULTIPLIER = 100000000;

export default {
  data() {
    return {
      address: "",
      amount: 0,
      fee: 0,
      valid: true,
      snackError: false,
      snackErrorMessage: "",
      transactionSentMessage: "",
      sending: false,
      addressRules: [
        v => isValidFctPublicAddress(v) || "Invalid public FCT address"
      ]
    };
  },
  computed: {
    factoshiAmount() {
      return this.amount * FACTOSHI_MULTIPLIER;
    },
    balances() {
      return this.$store.state.address.fctBalances;
    },
    totalBalance() {
      return Object.values(this.balances).reduce((acc, val) => acc + val, 0);
    },
    selfAddress() {
      return this.balances[this.address] || 0;
    },
    transactionProperties() {
      return [this.amount, this.address];
    },
    amountRules() {
      const totalBalance = this.totalBalance;
      const selfAddress = this.selfAddress;
      return [
        amount =>
          (typeof amount === "number" && amount > 0) ||
          "Amount must be strictly positive",
        function(amount) {
          if (selfAddress) {
            return (
              amount * FACTOSHI_MULTIPLIER <= totalBalance - selfAddress ||
              "Not enough funds"
            );
          } else {
            return amount * FACTOSHI_MULTIPLIER <= totalBalance || "Not enough funds";
          }
        }
      ];
    }
  },
  methods: {
    async send(e) {
      e.preventDefault();
      if (this.$refs.form.validate()) {
        try {
          this.transactionSentMessage = '';
          this.sending = true;
          const tx = await this.buildTransaction();
          const cli = this.$store.getters["factomd/cli"];
          const txId = await cli.sendTransaction(tx);
          this.$store.dispatch("address/fetchFctBalances");
          this.$store.dispatch("address/fetchEcBalances");
          this.transactionSentMessage = `Transaction sent. ID: ${txId}`;
        } catch (e) {
          this.snackError = true;
          this.snackErrorMessage = e.message;
        } finally {
          this.sending = false;
        }
      }
    },
    async getAdjustedInputs() {
      const cli = this.$store.getters["factomd/cli"];
      const ecRate = await cli.getEntryCreditRate();

      let inputsAmount = this.factoshiAmount;
      // Build initial TX without fees
      let inputs = this.computeInputs(inputsAmount);
      const txBuilder = Transaction.builder().output(
        this.address,
        this.factoshiAmount
      );
      for (const input of inputs) {
        txBuilder.input(input.address, input.amount);
      }
      let tx = txBuilder.build();

      // Iterate until finding the right fee
      while (tx.feesPaid < tx.computeRequiredFees(ecRate, { rcdType: 1 })) {
        const fees = tx.computeRequiredFees(ecRate, { rcdType: 1 });

        inputsAmount += fees;
        inputs = this.computeInputs(inputsAmount);

        const txBuilder = Transaction.builder().output(
          this.address,
          this.factoshiAmount
        );
        for (const input of inputs) {
          txBuilder.input(input.address, input.amount);
        }
        tx = txBuilder.build();
      }

      return { inputs, addedFee: inputsAmount - this.factoshiAmount };
    },
    computeInputs(amount) {
      if (amount > this.totalBalance - this.selfAddress) {
        throw new Error("Not enough funds to make that transaction");
      }

      const inputs = [];
      let amountToCover = amount;

      // Greedy algorithm to select inputs
      const balances = Object.keys(this.balances).map(address => ({
        address,
        balance: this.balances[address]
      }));
      balances.sort((a, b) => a.balance < b.balance);

      for (const b of balances) {
        if (b.address !== this.address && b.balance > 0) {
          if (amountToCover - b.balance > 0) {
            inputs.push({ address: b.address, amount: b.balance });
            amountToCover -= b.balance;
          } else {
            inputs.push({ address: b.address, amount: amountToCover });
            break;
          }
        }
      }

      return inputs;
    },
    async buildTransaction() {
      const { inputs } = await this.getAdjustedInputs();
      // Get inputs secret keys
      const walletd = this.$store.getters["walletd/cli"];
      const inputsSecrets = await Promise.map(inputs, async function(input) {
        const { secret } = await walletd.call("address", {
          address: input.address
        });
        return { secret, amount: input.amount };
      });

      // Build signed transaction with correct fees
      const signedTxBuilder = Transaction.builder().output(
        this.address,
        this.factoshiAmount
      );
      for (const input of inputsSecrets) {
        signedTxBuilder.input(input.secret, input.amount);
      }
      signedTxBuilder.build();

      return signedTxBuilder.build();
    }
  },
  watch: {
    async transactionProperties() {
      if (isValidFctPublicAddress(this.address)) {
        const { addedFee } = await this.getAdjustedInputs();
        this.fee = addedFee / FACTOSHI_MULTIPLIER;
      }
    }
  }
};
</script>

<style scoped>
</style>
