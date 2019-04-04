<template>
  <v-dialog v-model="display" lazy max-width="400px" @keydown.esc="display = false" @keydown.enter="display = false">
    <v-card>
      <v-card-title class="headline primary white--text" primary-title>Your Wallet Seed</v-card-title>
      <v-card-text class="headline font-weight-bold">
        <v-layout wrap>
          <v-flex xs12 text-xs-center v-for="(word, index) in seed" :key="word + index">{{ word }}</v-flex>
        </v-layout>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="display = false">Noted</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data: function() {
    return {
      display: false,
      seed: []
    };
  },
  methods: {
    show(seed) {
      this.seed = seed;
      this.display = true;
    }
  },
  watch: {
    async display() {
      if (!this.display) {
        // Erase seed from memory
        const that = this;
        setTimeout(() => (that.seed = ''), 300);
      }
    }
  }
};
</script>
