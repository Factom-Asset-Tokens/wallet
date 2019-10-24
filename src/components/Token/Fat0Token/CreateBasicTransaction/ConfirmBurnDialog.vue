<template>
  <v-dialog v-model="display" max-width="600px" @keydown.esc="close" @keydown.enter="confirm">
    <v-card>
      <v-card-title class="headline primary white--text" primary-title>Confirm burn</v-card-title>
      <v-card-text>
        <v-layout wrap>
          <v-flex xs12 text-xs-center class="subheading" my-2>Burning</v-flex>
          <v-flex xs12 text-xs-center class="title secondary--text" my-2>{{ amountText }} {{ symbol }}</v-flex>
          <v-flex xs12 v-if="metadata" text-xs-center class="subheading secondary--text" my-2>
            (with metadata attached)
          </v-flex>
        </v-layout>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" flat outline @click="close">Cancel</v-btn>
        <v-btn color="error" @click="confirm"><v-icon left>fas fa-fire-alt</v-icon>burn</v-btn>
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
    amountText() {
      if (this.transaction) {
        for (let [, amount] of Object.entries(this.transaction.getOutputs())) {
          return amount.toFormat();
        }
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
        throw new Error('Signed FAT-0 burn transaction only expected in this dialog');
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
