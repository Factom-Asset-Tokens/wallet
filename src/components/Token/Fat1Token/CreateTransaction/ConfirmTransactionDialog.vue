<template>
  <v-dialog v-model="display" max-width="800px" @keydown.esc="display = false" @keydown.enter="confirm">
    <v-card>
      <v-card-title class="headline primary white--text" primary-title>Confirm transaction</v-card-title>
      <v-card-text>
        <v-layout wrap>
          <v-flex xs12 text-xs-center class="subheading" my-2>Sending the following tokens</v-flex>
          <v-flex xs12 text-xs-center>
            <v-chip
              v-for="id in selectedTokens"
              :key="id.min"
              outline
              color="secondary"
              class="font-weight-bold subheading"
              >{{ id | displayIds }}</v-chip
            >
          </v-flex>
          <v-flex xs12 text-xs-center class="subheading" my-2>to</v-flex>
          <v-flex xs12 text-xs-center class="title secondary--text" my-2>{{ outputAddress }}</v-flex>
          <v-flex xs12 v-if="metadata" text-xs-center class="subheading secondary--text" my-2>
            (with metadata attached)
          </v-flex>
        </v-layout>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" flat outline @click="display = false">Cancel</v-btn>
        <v-btn color="primary" @click="confirm">Confirm</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Transaction from '@fat-token/fat-js/1/Transaction';
import { displayIds } from '@/components/Token/Fat1Token/nf-token-ids.js';

export default {
  data() {
    return {
      display: false,
      transaction: null
    };
  },
  computed: {
    output() {
      if (this.transaction) {
        for (let [address, tokens] of Object.entries(this.transaction.getOutputs())) {
          return { address, tokens };
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
    selectedTokens() {
      if (this.output) {
        return this.output.tokens;
      }
      return [];
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
        Object.keys(transaction.getInputs()).length === 0 ||
        Object.keys(transaction.getOutputs()).length !== 1
      ) {
        throw new Error('Signed FAT-1 miso transaction only expected in this dialog');
      }
      transaction.validateSignatures();
      this.transaction = transaction;
      this.display = true;
    },
    confirm() {
      this.$emit('confirmed', this.transaction);
      this.display = false;
    }
  },
  filters: {
    displayIds
  }
};
</script>
