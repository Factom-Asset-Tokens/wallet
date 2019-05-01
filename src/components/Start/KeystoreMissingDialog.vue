<template>
  <v-dialog v-model="display" lazy max-width="600px" persistent>
    <v-card>
      <v-card-title class="headline primary white--text" primary-title>Keystore inaccessible</v-card-title>
      <v-card-text>
        <v-layout wrap class="subheading">
          <v-flex xs12>
            <p>
              The keystore file your wallet is either missing or cannot be accessed (permissions) at this location:
            </p>
          </v-flex>
          <v-flex xs12 my-3>
            <kbd>{{ keystorePath }}</kbd>
          </v-flex>
          <v-flex xs12>
            <p>
              You can try to restore the file to its original location. Otherwise you will need to use your recovery
              phrase to restore your wallet.
            </p>
          </v-flex>
        </v-layout>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="close">Ok</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: ['keystorePath'],
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
