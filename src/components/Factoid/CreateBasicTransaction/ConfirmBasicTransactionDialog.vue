<template>
  <v-dialog v-model="display" lazy max-width="800px" @keydown.esc="close" @keydown.enter="confirm">
    <v-card>
      <v-card-title class="headline primary white--text" primary-title>Confirm transaction</v-card-title>
      <v-card-text>
        <v-layout wrap>
          <v-flex xs12 text-xs-center class="subheading" my-2>Sending</v-flex>
          <v-flex xs12 text-xs-center class="title secondary--text" mt-2>{{ amountText }} FCT</v-flex>
          <v-flex xs12 text-xs-center class="subheading secondary--text" mb-2
            >(+ {{ feeText }} FCT of fee burned)</v-flex
          >
          <v-flex xs12 text-xs-center class="subheading" my-2>from</v-flex>
          <v-flex xs12 text-xs-center class="title secondary--text" my-2>{{ inputAddress }}</v-flex>
          <v-flex xs12 text-xs-center class="subheading" my-2>to</v-flex>
          <v-flex xs12 text-xs-center class="title secondary--text" my-2>{{ outputAddress }}</v-flex>
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
import Big from 'bignumber.js';
const FACTOSHI_MULTIPLIER = new Big(100000000);

export default {
  data() {
    return {
      transaction: null,
      display: false
    };
  },
  computed: {
    inputAddress() {
      if (this.transaction) {
        return this.transaction.inputs[0].address;
      }
      return '??';
    },
    outputAddress() {
      if (this.transaction) {
        return this.transaction.factoidOutputs[0].address;
      }
      return '??';
    },
    feeText() {
      if (this.transaction) {
        return new Big(this.transaction.feesPaid).div(FACTOSHI_MULTIPLIER).toFormat();
      }
      return '??';
    },
    amountText() {
      if (this.transaction) {
        return new Big(this.transaction.totalFactoidOutputs).div(FACTOSHI_MULTIPLIER).toFormat();
      }
      return '??';
    }
  },
  methods: {
    show(transaction) {
      if (
        transaction.inputs.length !== 1 ||
        transaction.factoidOutputs.length !== 1 ||
        transaction.entryCreditOutputs.length !== 0
      ) {
        throw new Error('Factoid siso transaction only expected in this dialog');
      }
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
