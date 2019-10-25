<template>
  <v-dialog v-model="display" max-width="800px" @keydown.esc="close" persistent>
    <v-card>
      <v-card-title class="headline primary white--text" primary-title>Confirm transaction</v-card-title>
      <v-card-text>
        <v-layout wrap>
          <v-flex xs12 text-xs-center class="subheading" my-2>Sending</v-flex>
          <v-flex xs12 text-xs-center class="title secondary--text" my-2>{{ amountText }} {{ symbol }}</v-flex>
          <v-flex xs12 text-xs-center class="subheading" my-2>to</v-flex>
          <v-layout v-for="output in outputs" :key="output.id">
            <v-flex xs10 class="title secondary--text" my-2>{{ output.address }}</v-flex>
            <v-flex xs2 class="title secondary--text" text-xs-right my-2>{{ output.amount }} {{ symbol }}</v-flex>
          </v-layout>
          <v-flex xs12 v-if="metadata" text-xs-center class="subheading secondary--text" my-2>
            (with metadata attached)
          </v-flex>
          <v-flex xs12 my-3 v-show="withLedger"> <v-divider></v-divider> </v-flex>
          <v-flex xs12 v-show="withLedger">
            <LedgerSigning
              ref="ledgerSigning"
              :transaction="transaction"
              @error="error"
              @signedTx="emitSignedTransaction"
            ></LedgerSigning>
          </v-flex>
        </v-layout>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" flat outline @click="close">Cancel</v-btn>
        <v-btn color="primary" v-if="!withLedger" @click="emitSignedTransaction(transaction)">Confirm</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import LedgerSigning from '@/components/Token/Fat0Token/LedgerSigning.vue';
import Transaction from '@fat-token/fat-js/0/Transaction';
import Big from 'bignumber.js';

export default {
  components: { LedgerSigning },
  props: ['symbol'],
  data() {
    return {
      withLedger: false,
      transaction: null,
      display: false
    };
  },
  computed: {
    outputs() {
      if (this.transaction) {
        return Object.entries(this.transaction.getOutputs()).map(([address, amount]) => ({ address, amount }));
      }
      return [];
    },
    amountText() {
      if (this.outputs) {
        return this.outputs
          .map(o => o.amount)
          .reduce((acc, val) => acc.plus(val), new Big(0))
          .toFormat();
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
    show(transaction, withLedger) {
      if (!(transaction instanceof Transaction)) {
        throw new Error('FAT-0 mimo transaction only expected in this dialog');
      }
      this.withLedger = withLedger;
      this.transaction = transaction;
      this.display = true;
      if (withLedger) {
        this.$refs.ledgerSigning.activate();
      } else {
        transaction.validateSignatures();
      }
    },
    close() {
      this.display = false;
      if (this.withLedger) {
        this.$refs.ledgerSigning.deactivate();
      }
    },
    error(e) {
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
