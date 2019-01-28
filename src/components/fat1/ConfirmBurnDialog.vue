<template>
  <v-dialog
    v-model="display"
    max-width="800px"
    @keydown.esc="display = false"
    @keydown.enter="confirm"
  >
    <v-card>
      <v-card-title class="headline primary white--text" primary-title>Confirm burn</v-card-title>
      <v-card-text>
        <v-layout wrap>
          <v-flex
            xs12
            text-xs-center
            class="subheading"
            my-2
          >Burning the following tokens</v-flex>
          <v-flex xs12 text-xs-center>
            <v-chip
              v-for="id in selectedTokens"
              :key="id.from || id"
              outline
              color="secondary"
              class="font-weight-bold subheading"
            >{{id | displayIds}}</v-chip>
          </v-flex>
        </v-layout>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" flat outline @click="display = false">Cancel</v-btn>
        <v-btn color="error" @click="confirm"><v-icon left>fas fa-fire-alt</v-icon>burn</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { displayIds } from "./ids-utils.js";

export default {
  props: ["selectedTokens"],
  data() {
    return {
      display: false
    };
  },
  methods: {
    show() {
      this.display = true;
    },
    confirm() {
      this.$emit("confirmed");
      this.display = false;
    }
  },
  filters: {
    displayIds
  }
};
</script>