<template>
  <v-layout wrap align-baseline>
    <v-layout wrap v-if="min !== max" mb-2>
      <v-flex xs4 text-xs-right>
        <v-btn flat icon color="secondary" @click="decrement">
          <v-icon>chevron_left</v-icon>
        </v-btn>
      </v-flex>
      <v-flex xs4 text-xs-center>
        <v-text-field prefix="#" v-model.number="id" single-line required></v-text-field>
      </v-flex>
      <v-flex xs4 text-xs-left>
        <v-btn flat icon color="secondary" @click="increment">
          <v-icon>chevron_right</v-icon>
        </v-btn>
      </v-flex>
    </v-layout>
    <v-flex xs12 my-2><span class="font-weight-bold secondary--text">Owner</span> {{ data.owner }} </v-flex>
    <template v-if="data.metadata">
      <v-flex xs12 my-2 class="font-weight-bold secondary--text">Metadata</v-flex>
      <v-flex xs12>
        <v-sheet color="grey darken-2">
          <v-container>
            <pre>{{ data.metadata }}</pre>
          </v-container>
        </v-sheet>
      </v-flex>
    </template>
  </v-layout>
</template>

<script>
export default {
  props: ['min', 'max', 'tokenCli'],
  data() {
    return {
      id: this.min,
      data: ''
    };
  },
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
  },
  watch: {
    async id() {
      this.data = await this.tokenCli.getNFToken(this.id);
    }
  }
};
</script>
