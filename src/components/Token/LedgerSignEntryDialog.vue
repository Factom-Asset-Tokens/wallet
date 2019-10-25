<template>
  <v-dialog v-model="display" max-width="800px" @keydown.esc="close" @keydown.enter="confirm" persistent>
    <v-card>
      <v-card-text>
        <v-layout wrap>
          <v-flex xs12 text-xs-center class="subheading secondary--text" my-2
            >Confirm on your Ledger the entry signature to send the transaction.</v-flex
          >
        </v-layout>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data() {
    return {
      display: false
    };
  },
  methods: {
    show() {
      this.display = true;
    },
    close() {
      this.display = false;
    }
  }
};
</script>
