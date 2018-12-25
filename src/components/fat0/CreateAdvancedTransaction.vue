<template>
  <v-form v-model="validForm" ref="form" lazy-validation>
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
      <v-flex xs12 v-for="(input, index) in inputs" :key="'input-' + input.id">
        <TransactionInput
          v-model="inputs[index]"
          @delete="deleteInoutput('inputs', input.id)"
          :balances="balances"
          :first="index === 0"
          :symbol="symbol"
          :alreadySelectedAddresses="selectedInputAddresses"
        ></TransactionInput>
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

      <v-flex xs12 v-for="(output, index) in outputs" :key="'output-' + output.id">
        <v-layout row wrap align-center justify-center>
          <v-flex xs12 md8 pr-4>
            <v-text-field
              label="Address"
              v-model.trim="output.address"
              :rules="outputAddressRules"
              size="50"
              solo
              required
            ></v-text-field>
          </v-flex>
          <v-flex xs11 md3>
            <v-text-field
              v-model.number="output.amount"
              type="number"
              :suffix="symbol"
              :rules="outputAmountRules"
              min="0"
              label="Amount"
              required
            ></v-text-field>
          </v-flex>
          <v-flex xs1 text-xs-center>
            <v-icon v-if="index !== 0" @click="deleteInoutput('outputs', output.id)">delete</v-icon>
          </v-flex>
        </v-layout>
      </v-flex>

      <v-layout align-center wrap>
        <v-flex xs12 sm10>
          <v-alert
            v-if="sendClicked"
            :value="!validTransaction"
            color="error"
            icon="warning"
            outline
          >{{transactionError}}</v-alert>
        </v-flex>

        <v-flex xs12 sm2 text-xs-right>
          <v-btn large :disabled="!validForm" @click="send">Send<v-icon right>send</v-icon></v-btn>
        </v-flex>
      </v-layout>
    </v-layout>
  </v-form>
</template>

<script>
import { isValidFctPublicAddress } from "factom";
import TransactionInput from "@/components/fat0/TransactionInput";

const newInoutput = (function() {
  let i = 0;
  return function() {
    return { id: i++, address: "", amount: 0 };
  };
})();

export default {
  components: { TransactionInput },
  data() {
    return {
      sendClicked: false,
      validForm: true,
      validTransaction: true,
      transactionError: "",
      inputs: [],
      outputs: []
    };
  },
  props: ["balances", "symbol"],
  created() {
    this.add("inputs");
    this.add("outputs");
  },
  computed: {
    selectedInputAddresses() {
      return new Set(this.inputs.map(i => i.address));
    },
    outputAddressesCounter() {
      return this.outputs.reduce((acc, val) => {
        acc[val.address] ? acc[val.address]++ : (acc[val.address] = 1);
        return acc;
      }, {});
    },
    outputAddressRules() {
      return [
        address =>
          isValidFctPublicAddress(address) || "Invalid public FCT address"
      ];
    },
    outputAmountRules() {
      return [v => v > 0 || "Amount must be strictly positive"];
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
    },
    validTransactionProperties() {
      return this.totalInputs, this.totalOutputs, this.outputAddressesCounter;
    }
  },
  methods: {
    add: function(type) {
      this[type].push(newInoutput());
    },
    deleteInoutput(type, id) {
      this[type] = this[type].filter(v => v.id !== id);
    },
    send() {
      if (this.$refs.form.validate()) {
        this.sendClicked = true;
        if (this.validTransaction) {
          console.log("SEND");
        }
      }
    }
  },
  watch: {
    validTransactionProperties() {
      for (const address in this.outputAddressesCounter) {
        if (this.outputAddressesCounter[address] > 1) {
          this.validTransaction = false;
          this.transactionError = `The same address is used in multiple outputs (${address}).`;
          return;
        }
      }
      if (this.totalInputs !== this.totalOutputs) {
        this.validTransaction = false;
        this.transactionError = "The sum of inputs and outputs must be equal.";
        return;
      }
      if (this.totalInputs === 0) {
        this.validTransaction = false;
        this.transactionError = "The amount transfered cannot be 0.";
        return;
      }

      this.validTransaction = true;
      this.transactionError = "";
    }
  }
};
</script>

<style scoped>
.total-amount {
  margin-right: 36px;
}
</style>
