<template>
  <div>
    <v-layout row wrap>
      <v-flex xs12 pb-4>
        <v-toolbar>
          <v-toolbar-title>Inputs</v-toolbar-title>

          <v-spacer></v-spacer>
          <div class="total-amount">{{totalInputs}} {{symbol}}</div>
          <v-toolbar-items>
            <v-btn flat @click="add('inputs')">
              <v-icon>add_circle_outline</v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
      </v-flex>
      <v-flex xs12 v-for="(input, index) in inputs" :key="index">
        <v-layout row wrap align-center justify-center>
          <v-flex xs8>
            <v-select
              :items="availableAddresses(input)"
              label="Address"
              solo
              v-model="input.address"
              dense
            ></v-select>
          </v-flex>
          <v-flex xs3 pl-4>
            <v-text-field
              v-if="input.address"
              v-model.number="input.amount"
              :error-messages="validateInputAmount(input)"
              type="number"
              :suffix="symbol"
              min="0"
              label="Amount"
              required
            ></v-text-field>
          </v-flex>
          <v-flex xs1 text-xs-center>
            <v-icon @click="deleteInoutput('inputs', index)">delete</v-icon>
          </v-flex>
        </v-layout>
      </v-flex>
      <v-flex xs12 pb-4>
        <v-toolbar>
          <v-toolbar-title>Outputs</v-toolbar-title>

          <v-spacer></v-spacer>
          <div class="total-amount">{{totalOutputs}} {{symbol}}</div>
          <v-toolbar-items>
            <v-btn flat @click="add('outputs')">
              <v-icon>add_circle_outline</v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
      </v-flex>

      <v-flex xs12 v-for="(output, index) in outputs" :key="index">
        <v-layout row wrap align-center justify-center>
          <v-flex xs8>
            <v-text-field
              label="Address"
              v-model="output.address"
              :rules="[validateOutputAddress]"
              size="50"
              solo
              required
            ></v-text-field>
          </v-flex>
          <v-flex xs3 pl-4>
            <v-text-field
              v-model.number="output.amount"
              type="number"
              :suffix="symbol"
              min="0"
              label="Amount"
              required
            ></v-text-field>
          </v-flex>
          <v-flex xs1 text-xs-center>
            <v-icon @click="deleteInoutput('outputs', index)">delete</v-icon>
          </v-flex>
        </v-layout>
      </v-flex>
      <v-flex xs12 text-xs-right>
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
      inputs: [{ address: "", amount: 0, errorMessages: [] }],
      outputs: [{ address: "", amount: 0, errorMessages: [] }]
    };
  },
  props: ["balances", "symbol"],
  computed: {
    addresseBalanceMap() {
      return this.balances.reduce((acc, val) => {
        acc[val.address] = val.balance;
        return acc;
      }, {});
    },
    totalInputs() {
      return this.inputs
        .map(o => o.amount)
        .filter(a => typeof a === "number")
        .reduce((a, b) => a + b, 0);
    },
    totalOutputs() {
      return this.outputs
        .map(o => o.amount)
        .filter(a => typeof a === "number")
        .reduce((a, b) => a + b, 0);
    }
  },
  methods: {
    add: function(type) {
      this[type].push({ address: "", amount: 0, errorMessages: [] });
    },
    availableAddresses(input) {
      const that = this;
      const alreadySelected = new Set(this.inputs.map(input => input.address));
      return this.balances
        .filter(
          b => !alreadySelected.has(b.address) || b.address === input.address
        )
        .map(b => ({
          value: b.address,
          text: `${b.name || b.address} (${b.balance} ${that.symbol})`
        }));
    },
    validateInputAmount(input) {
      const result = [];
      if (typeof input.amount !== "number" || input.amount < 0) {
        result.push("Amount must be a positive number");
      }
      if (input.amount > this.addresseBalanceMap[input.address]) {
        result.push("Address doesn't hold enough funds");
      }
      return result;
    },
    validateOutputAddress(address) {
      return isValidFctPublicAddress(address) || "Invalid public FCT address";
    },
    deleteInoutput(type, index) {
      this[type] = this[type].filter((v, i) => i !== index);
    }
  }
};
</script>

<style scoped>
.total-amount {
  margin-right: 36px;
}
</style>
