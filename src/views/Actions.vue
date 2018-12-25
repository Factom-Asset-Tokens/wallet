<template>
  <v-container>
    <v-layout wrap>
      <v-flex xs12 sm6 offset-sm3 my-4>
        <v-btn color="primary" large block :to="{name: 'TrackToken'}"><v-icon left>track_changes</v-icon> Track existing token</v-btn>
      </v-flex>
      <v-flex xs12 sm6 offset-sm3 my-4>
        <v-btn color="primary" large block :to="{name: 'IssueToken'}"><v-icon left>create</v-icon> Issue a new token</v-btn>
      </v-flex>
      <v-flex xs12 sm6 offset-sm3 my-4>
        <v-btn color="primary" large block><v-icon left>send</v-icon> Create a coinbase transaction</v-btn>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  mounted() {
    // TODO: should be done once at the startup of the whole application
    this.$store.dispatch("walletd/init");
    this.$store.dispatch("fatd/init");
    this.$store.dispatch("identity/init");
  }
};
</script>

<style scoped>
</style>
