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
import Big from 'bignumber.js';
export default {
  props: ['amount', 'symbol', 'metadata'],
  data() {
    return {
      display: false
    };
  },
  computed: {
    amountText() {
      try {
        return new Big(this.amount).toFormat();
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
