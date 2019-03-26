<template>
  <v-dialog v-model="display" lazy max-width="800px" @keydown.esc="display = false">
    <v-card>
      <v-card-title class="headline primary white--text" primary-title>Unlink Identity</v-card-title>
      <v-card-text class="subheading">
        <p>
          You are about to unlink the identity
          <span class="primary--text">{{ identity }}</span> from the wallet.
        </p>
        <p>
          Associated keys will remain stored so that they will be available if you restore this identity at a later
          time.
        </p>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" flat outline @click="display = false">Close</v-btn>
        <v-btn color="primary" @click="unlinkIdentity">unlink</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data: function() {
    return {
      display: false,
      identity: ''
    };
  },
  methods: {
    show(identity) {
      this.identity = identity;
      this.display = true;
    },
    unlinkIdentity() {
      this.$store.commit('identity/unlinkIdentity', this.identity);
      this.display = false;
    }
  }
};
</script>
