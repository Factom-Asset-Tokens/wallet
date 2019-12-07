<template>
  <v-dialog v-model="display" max-width="900px" @keydown.esc="close" persistent>
    <v-card>
      <v-card-title class="headline primary white--text" primary-title>Confirm transaction</v-card-title>
      <v-card-text>
        <v-layout wrap>
          <v-flex xs12 text-xs-center class="subheading" my-2>Sending</v-flex>
          <v-flex xs12 text-xs-center class="title secondary--text" my-2>{{ amountText }} FCT</v-flex>
          <v-flex xs12 text-xs-center class="subheading secondary--text" mb-2> (+ {{ txFeeText }} FCT of fee) </v-flex>
          <v-flex xs12 text-xs-center class="subheading" my-2>from</v-flex>
          <v-layout v-for="(input, index) in inputsText" :key="'input-' + index">
            <v-flex xs10 class="title secondary--text" my-2>{{ input.address }}</v-flex>
            <v-flex xs2 class="title secondary--text" text-xs-right my-2>{{ input.amount }} FCT</v-flex>
          </v-layout>
          <v-flex xs12 text-xs-center class="subheading" my-2>to</v-flex>
          <v-layout v-for="(output, index) in outputsText" :key="'output-' + index">
            <v-flex xs10 class="title secondary--text" my-2>{{ output.address }}</v-flex>
            <v-flex xs2 class="title secondary--text" text-xs-right my-2>{{ output.amount }} FCT</v-flex>
          </v-layout>
          <v-flex xs12 my-3> <v-divider></v-divider> </v-flex>
          <v-flex xs12>
            <LedgerSigning
              ref="ledgerSigning"
              :transaction="transaction"
              @error="signingError"
              @signedTx="emitSignedTransaction"
            ></LedgerSigning>
          </v-flex>
        </v-layout>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" flat outline @click="close">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Big from 'bignumber.js';

import LedgerSigning from '@/components/Factoid/LedgerSigning.vue';

const ZERO = new Big(0);
const FACTOSHI_MULTIPLIER = new Big(100000000);

export default {
  components: { LedgerSigning },
  data() {
    return {
      transaction: null,
      display: false
    };
  },
  computed: {
    inputs() {
      return this.transaction ? this.transaction.inputs : [];
    },
    outputs() {
      return this.transaction ? this.transaction.factoidOutputs : [];
    },
    txFee() {
      return this.totalInputs.minus(this.totalOutputs);
    },
    totalInputs() {
      return this.inputs
        .map(o => o.amount)
        .filter(a => !!a)
        .reduce((acc, val) => acc.plus(val), ZERO);
    },
    totalOutputs() {
      return this.outputs
        .map(o => o.amount)
        .filter(a => !!a)
        .reduce((acc, val) => acc.plus(val), ZERO);
    },
    // Data formatted for rendering
    inputsText() {
      return this.inputs.map(i => ({
        address: i.address,
        amount: new Big(i.amount).div(FACTOSHI_MULTIPLIER).toFormat()
      }));
    },
    outputsText() {
      return this.outputs.map(o => ({
        address: o.address,
        amount: new Big(o.amount).div(FACTOSHI_MULTIPLIER).toFormat()
      }));
    },
    txFeeText() {
      return this.totalInputs
        .minus(this.totalOutputs)
        .div(FACTOSHI_MULTIPLIER)
        .toFormat();
    },
    amountText() {
      return this.totalOutputs.div(FACTOSHI_MULTIPLIER).toFormat();
    }
  },
  methods: {
    show(transaction) {
      this.transaction = transaction;
      this.display = true;
      this.$refs.ledgerSigning.activate();
    },
    close() {
      this.display = false;
      this.$refs.ledgerSigning.deactivate();
    },
    signingError(e) {
      this.$emit('error', e);
      this.close();
    },
    emitSignedTransaction(tx) {
      this.$emit('confirmed', tx);
      this.close();
    }
  }
};
</script>
