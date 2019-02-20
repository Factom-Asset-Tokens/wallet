<template>
  <v-dialog v-model="display" lazy max-width="800px" @keydown.esc="display = false">
    <v-card>
      <v-card-title class="headline primary white--text" primary-title>Identity removal</v-card-title>
      <v-card-text class="subheading">Confirm the removal of identity
        <div class="primary--text">{{identity}}</div>from the wallet. 
        Associated keys will remain stored so that they will be available if you restore this identity at a later time.
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" flat outline @click="display = false">Close</v-btn>
        <v-btn color="primary" @click="deleteIdentity">Confirm</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>


<script>
export default {
  data: function() {
    return {
      display: false,
      identity: ""
    };
  },
  methods: {
    show(identity) {
      this.identity = identity;
      this.display = true;
    },
    deleteIdentity() {
      this.$store.commit("identity/removeIdentity", this.identity);
      this.display = false;
    }
  }
};
</script>


