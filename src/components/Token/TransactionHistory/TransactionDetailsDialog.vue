<template>
  <v-dialog
    v-model="display"
    lazy
    max-width="1024px"
    @keydown.esc="display = false"
    @keydown.enter="display = false"
  >
    <v-card v-if="transaction">
      <v-card-title class="headline primary white--text" primary-title>Transaction details</v-card-title>
      <v-card-text>
        <v-container fluid class="subheading">
          <v-layout wrap>
            <v-flex xs2 class="font-weight-bold secondary--text">Transaction ID</v-flex>
            <v-flex xs10>{{txId}}</v-flex>
            <v-flex xs2 class="font-weight-bold secondary--text">Time</v-flex>
            <v-flex xs10>{{timestamp | formatTimestamp}}</v-flex>
            <v-flex xs2 class="font-weight-bold secondary--text">Total</v-flex>
            <v-flex xs10>{{totalText}} {{symbol}}</v-flex>
            <v-flex xs12 class="font-weight-bold secondary--text" mt-4>
              <v-icon left color="secondary">fa-sign-in-alt</v-icon>Inputs
            </v-flex>
            <InoutputDetails :ios="inputs" type="input"></InoutputDetails>
            <v-flex xs12 class="font-weight-bold secondary--text">
              <v-icon left color="secondary">fa-sign-out-alt</v-icon>Outputs
            </v-flex>
            <InoutputDetails :ios="outputs" type="output"></InoutputDetails>
            <template v-if="metadata">
              <v-flex xs12 my-3 class="font-weight-bold secondary--text">Metadata</v-flex>
              <v-flex xs12 mb-3>{{metadata}}</v-flex>
            </template>
          </v-layout>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="display = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import moment from "moment";
import InoutputDetails from "./InoutputDetails";
import {
  transformInoutputsToArray,
  getTotalTransaction
} from "./transaction-history-util.js";

export default {
  components: { InoutputDetails },
  props: ["symbol"],
  data() {
    return {
      display: false,
      transaction: null
    };
  },
  computed: {
    txId() {
      return this.transaction.getEntryhash();
    },
    timestamp() {
      return this.transaction.getTimestamp();
    },
    metadata() {
      return this.transaction.getMetadata();
    },
    inputs() {
      return transformInoutputsToArray(this.transaction.getInputs());
    },
    outputs() {
      return transformInoutputsToArray(this.transaction.getOutputs());
    },
    totalText() {
      return getTotalTransaction(this.transaction).toLocaleString();
    }
  },
  methods: {
    show(transaction) {
      this.transaction = transaction;
      this.display = true;
    }
  },
  filters: {
    formatTimestamp(timestamp) {
      return moment(timestamp * 1000).format("LL LT");
    }
  }
};
</script>