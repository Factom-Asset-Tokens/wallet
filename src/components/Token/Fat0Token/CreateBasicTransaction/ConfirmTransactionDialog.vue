<template>
  <v-dialog v-model="display" max-width="800px" @keydown.esc="close" @keydown.enter="confirm">
    <v-card>
      <v-card-title class="headline primary white--text" primary-title>Confirm transaction</v-card-title>
      <v-card-text>
        <v-layout wrap>
          <v-flex xs12 text-xs-center class="subheading" my-2>Sending</v-flex>
          <v-flex xs12 text-xs-center class="title secondary--text" my-2>{{ amountText }} {{ symbol }}</v-flex>
          <v-flex xs12 text-xs-center class="subheading" my-2>to</v-flex>
          <v-flex xs12 text-xs-center class="title secondary--text" my-2>{{ outputAddress }}</v-flex>
          <v-flex xs12 v-if="metadata" text-xs-center class="subheading secondary--text" my-2
            >(with metadata attached)</v-flex
          >
        </v-layout>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" flat outline @click="close">Cancel</v-btn>
        <v-btn color="primary" @click="confirm">Confirm</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Transaction from '@fat-token/fat-js/0/Transaction';

export default {
  props: ['symbol'],
  data() {
    return {
      transaction: null,
      display: false
    };
  },
  computed: {
    output() {
      if (this.transaction) {
        for (let [address, amount] of Object.entries(this.transaction.getOutputs())) {
          return { address, amount };
        }
      }
      return null;
    },
    outputAddress() {
      if (this.output) {
        return this.output.address;
      }
      return '??';
    },
    amountText() {
      if (this.output) {
        return this.output.amount.toFormat();
      }
      return '??';
    },
    metadata() {
      if (this.transaction) {
        return this.transaction.getMetadata();
      }
      return null;
    }
  },
  methods: {
    show(transaction) {
      if (
        !(transaction instanceof Transaction) ||
        Object.keys(transaction.getInputs()).length !== 1 ||
        Object.keys(transaction.getOutputs()).length !== 1
      ) {
        throw new Error('Signed FAT-0 siso transaction only expected in this dialog');
      }
      transaction.validateSignatures();
      this.transaction = transaction;
      this.display = true;
    },
    close() {
      this.display = false;
    },
    confirm() {
      this.$emit('confirmed', this.transaction);
      this.close();
    }
  }
};
</script>
