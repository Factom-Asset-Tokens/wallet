<template>
  <v-dialog v-model="display" lazy max-width="800px" @keydown.esc="close" @keydown.enter="confirm">
    <v-card>
      <v-card-title class="headline primary white--text" primary-title>Confirm transaction</v-card-title>
      <v-card-text>
        <v-layout wrap>
          <v-flex xs12 text-xs-center class="subheading" my-2>Converting</v-flex>
          <v-flex xs12 text-xs-center class="title secondary--text" mt-2>{{ fctCostText }} FCT</v-flex>
          <v-flex xs12 text-xs-center class="subheading" my-2>to</v-flex>
          <v-flex xs12 text-xs-center class="title secondary--text" my-2>{{ ecAmountText }} EC</v-flex>
          <v-flex xs12 text-xs-center class="subheading" my-2>and sending to</v-flex>
          <v-flex xs12 text-xs-center class="title secondary--text" my-2>{{ address }}</v-flex>
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
      ecRate: new Big(0),
      transaction: null,
      display: false
    };
  },
  computed: {
    fctCostText() {
      if (this.transaction) {
        return new Big(this.transaction.inputs[0].amount).div(FACTOSHI_MULTIPLIER).toFormat();
      }
      return '??';
    },
    ecAmountText() {
      if (this.transaction) {
        return new Big(this.transaction.entryCreditOutputs[0].amount).div(this.ecRate).toFormat();
      }
      return '??';
    },
    address() {
      if (this.transaction) {
        return this.transaction.entryCreditOutputs[0].address;
      }
      return '??';
    }
  },
  methods: {
    show(tx, ecRate) {
      if (tx.inputs.length !== 1 || tx.factoidOutputs.length !== 0 || tx.entryCreditOutputs.length !== 1) {
        throw new Error('EC siso transaction only expected in this dialog');
      }
      this.transaction = tx;
      this.ecRate = ecRate;
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
