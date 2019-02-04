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
        <TokenDetails ref="rangeDetails" :tokenCli="tokenCli" :min="id.from" :max="id.to"></TokenDetails>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="display = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import TokenDetails from "./TokenDetails";

export default {
  components: { TokenDetails },
  props: ["symbol", "tokenCli"],
  data() {
    return {
      display: false,
      id: {}
    };
  },
  computed: {
    title() {
      return this.id.from === this.id.to
        ? `#${this.id.from}`
        : `#${this.id.from} to #${this.id.to}`;
    }
  },
  methods: {
    async show(id) {
      if (this.$refs.rangeDetails) {
        this.$refs.rangeDetails.setId(id.from);
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