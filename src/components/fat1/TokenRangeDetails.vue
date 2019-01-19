<template>
  <v-layout wrap align-baseline>
    <v-flex xs3 text-xs-right>
      <v-btn flat icon color="secondary" @click="decrement">
        <v-icon>chevron_left</v-icon>
      </v-btn>
    </v-flex>
    <v-flex xs6 text-xs-center>
      <v-text-field prefix="#" v-model.number="id" label="ID" required solo></v-text-field>
    </v-flex>
    <v-flex xs3 text-xs-left>
      <v-btn flat icon color="secondary" @click="increment">
        <v-icon>chevron_right</v-icon>
      </v-btn>
    </v-flex>
    <v-flex xs12>Token details of #{{id}} here...</v-flex>
  </v-layout>
</template>

<script>
export default {
  props: ["min", "max"],
  data() {
    return {
      id: this.min
    };
  },
  computed: {},
  methods: {
    setId(id) {
      this.id = id;
    },
    decrement() {
      if (this.id > this.min) {
        if (this.id > this.max) {
          this.id = this.max;
        } else {
          this.id--;
        }
      }
    },
    increment() {
      if (this.id < this.max) {
        if (this.id < this.min) {
          this.id = this.min;
        } else {
          this.id++;
        }
      }
    }
  }
};
</script>