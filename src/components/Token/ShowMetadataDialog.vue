<template>
  <v-dialog v-model="display" lazy max-width="600px" @keydown.esc="close" @keydown.enter="close">
    <v-card>
      <v-card-title class="headline primary white--text" primary-title>{{ tokenId }} metadata</v-card-title>
      <v-card-text>
        <v-layout wrap>
          <v-flex xs12>
            <v-sheet color="grey darken-2">
              <v-container>
                <pre>{{ metadata }}</pre>
              </v-container>
            </v-sheet>
          </v-flex>
        </v-layout>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="close">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: ['metadata', 'tokenId'],
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
