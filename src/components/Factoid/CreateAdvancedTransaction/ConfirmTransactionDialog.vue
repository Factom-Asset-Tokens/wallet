<template>
  <v-dialog v-model="display" max-width="800px" @keydown.esc="close" @keydown.enter="confirm">
    <v-card>
      <v-card-title class="headline primary white--text" primary-title>Confirm transaction</v-card-title>
      <v-card-text>
        <v-layout wrap>
          <v-flex xs12 text-xs-center class="subheading" my-2>Sending</v-flex>
          <v-flex xs12 text-xs-center class="title secondary--text" my-2>{{ amountText }} FCT</v-flex>
          <v-flex xs12 text-xs-center class="subheading secondary--text" mb-2>
            (+ {{ txFee.toFormat() }} FCT of fee burned)
          </v-flex>
          <v-flex xs12 text-xs-center class="subheading" my-2>to</v-flex>
          <v-layout v-for="output in outputs" :key="output.id">
            <v-flex xs10 class="title secondary--text" my-2>{{ output.address }}</v-flex>
            <v-flex xs2 class="title secondary--text" text-xs-right my-2>{{ output.amount }} FCT</v-flex>
          </v-layout>
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

export default {
  props: ['outputs', 'txFee'],
  data() {
    return {
      display: false
    };
  },
  computed: {
    amountText() {
      try {
        return this.outputs
          .map(o => o.amount)
          .reduce((acc, val) => acc.plus(val), new Big(0))
          .toFormat();
      } catch (e) {
        return '??';
      }
    }
  },
  methods: {
    show() {
      this.display = true;
    },
    close() {
      this.display = false;
    },
    confirm() {
      this.$emit('confirmed');
      this.close();
    }
  }
};
</script>
