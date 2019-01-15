<template>
  <v-form v-model="valid" ref="form" @submit="send" lazy-validation>
    <v-layout row wrap align-baseline>
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
          :suffix="symbol"
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
      <v-flex v-if="errorMessage" xs12 md8 offset-md2>
        <v-alert :value="true" type="error" outline dismissible>{{errorMessage}}</v-alert>
      </v-flex>
      <v-flex xs12>
        <v-alert :value="transactionSentMessage" type="success" outline dismissible>{{transactionSentMessage}}</v-alert>
      </v-flex>
    </v-layout>
  </v-form>
</template>

<script>
import Promise from "bluebird";
import { isValidFctPublicAddress } from "factom";
import SendTransaction from "@/mixins/SendTransaction";
import { FAT0 } from "@fat-token/fat-js";
const {
  Transaction: { TransactionBuilder }
} = FAT0;

export default {
  mixins: [SendTransaction],
  data() {
    return {
      address: "",
      amount: 0,
      valid: true,
      errorMessage: "",
      addressRules: [
        v => isValidFctPublicAddress(v) || "Invalid public FCT address"
      ]
    };
  },
  props: ["balances", "symbol", "tokenCli"],
  computed: {
    totalBalance() {
      return this.balances.reduce((acc, val) => acc + val.balance, 0);
    },
    selfAddress() {
      return this.balances.find(b => b.address === this.address);
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
              amount <= totalBalance - selfAddress.balance || "Not enough funds"
            );
          } else {
            return amount <= totalBalance || "Not enough funds";
          }
        }
      ];
    }
  },
  methods: {
    async send(e) {
      e.preventDefault();
      if (this.$refs.form.validate()) {
        this.sendTransaction();
      }
    },
    async buildTransaction() {
      // Greedy algorithm to select inputs
      const inputs = [];
      let amountToCover = this.amount;
      for (const b of this.balances) {
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

      // Get inputs secret keys
      const walletd = this.$store.getters["walletd/cli"];
      const inputsSecrets = await Promise.map(inputs, async function(input) {
        const { secret } = await walletd.call("address", {
          address: input.address
        });
        return { secret, amount: input.amount };
      });

      // Build transaction object
      const txBuilder = new TransactionBuilder(
        this.tokenCli.getTokenChainId()
      ).output(this.address, this.amount);
      for (const input of inputsSecrets) {
        txBuilder.input(input.secret, input.amount);
      }

      return txBuilder.build();
    }
  }
};
</script>

<style scoped>
</style>
