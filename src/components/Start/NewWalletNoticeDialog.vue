<template>
  <v-dialog v-model="display" lazy max-width="600px" @keydown.esc="close" @keydown.enter="confirm">
    <v-card>
      <v-card-title class="headline primary white--text" primary-title>New Wallet Notice</v-card-title>
      <v-card-text>
        <v-layout wrap class="subheading">
          <v-flex xs12 mb-3>
            <span class="secondary--text"
              >If you create a new wallet your current wallet will be entirely replaced.</span
            >
            It may be useful if you cannot access your current wallet anymore or just want to start over a brand new
            wallet.
          </v-flex>
          <v-flex xs12>
            Please note that the keystore of your current wallet will nonetheless remain encrypted on your disk at this
            location:
          </v-flex>
          <v-flex xs12 my-3>
            <kbd>{{ keystorePath }}</kbd>
          </v-flex>
          <v-flex xs12>
            If you are certain you will never need it again you may delete it yourself from the file system.
          </v-flex>
        </v-layout>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" flat outline @click="close">Cancel</v-btn>
        <v-btn color="primary" @click="confirm">Continue</v-btn>
      </v-card-actions>
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
  computed: {
    keystorePath() {
      return this.$store.state.keystore.filename;
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
      this.$emit('newWallet');
      this.close();
    }
  }
};
</script>
