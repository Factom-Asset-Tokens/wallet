<template>
  <v-dialog
    v-model="display"
    max-width="600px"
    @keydown.esc="display = false"
    @keydown.enter="display = false"
    @keydown.left="decrement"
    @keydown.right="increment"
  >
    <v-card>
      <v-card-title class="headline primary white--text" primary-title>{{symbol}} {{title}}</v-card-title>
      <v-card-text>
        <NfTokenDetails ref="rangeDetails" :tokenCli="tokenCli" :min="id.min" :max="id.max"></NfTokenDetails>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="display = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import NfTokenDetails from "./NfTokenDetailsDialog/NfTokenDetails";

export default {
  components: { NfTokenDetails },
  props: ["symbol", "tokenCli"],
  data() {
    return {
      display: false,
      id: {}
    };
  },
  computed: {
    title() {
      return this.id.min === this.id.max
        ? `#${this.id.min}`
        : `#${this.id.min} to #${this.id.max}`;
    }
  },
  methods: {
    async show(id) {
      if (this.$refs.rangeDetails) {
        this.$refs.rangeDetails.setId(id.min);
      }
      this.display = true;
      this.id = id;
    },
    decrement() {
      if (this.$refs.rangeDetails) {
        this.$refs.rangeDetails.decrement();
      }
    },
    increment() {
      if (this.$refs.rangeDetails) {
        this.$refs.rangeDetails.increment();
      }
    }
  }
};
</script>