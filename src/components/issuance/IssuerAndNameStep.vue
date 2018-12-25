<template>
  <v-layout row wrap>
    <v-flex xs12 my-3>
      <v-text-field :rules="nameRules" label="Choose a name for your token"></v-text-field>
    </v-flex>
    <v-flex xs12 my-3>
      <v-select
        :items="identities"
        no-data-text="No identity available (go to settings to create a new one)."
        :rules="identityRules"
        v-model="issuerId"
        label="Select the issuing identity"
        solo
      ></v-select>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  data: () => ({
    tokenId: "",
    issuerId: ""
  }),
  computed: {
    identities() {
      return Object.keys(this.$store.state.identity.identities);
    },
    identityRules() {
      const identityStore = this.$store.state.identity;

      return [
        v => !!v || "Select an issuing identity",
        function(v) {
          console.log("val", v);
          if (v) {
            const availableKeys = identityStore.identities[v].filter(k =>
              identityStore.identityKeysInWallet.has(k)
            );
            return (
              availableKeys.length > 0 ||
              "No identity keys available in the wallet for this identity."
            );
          } else {
            return true;
          }
        }
      ];
    },
    nameRules() {
      return [v => !!v || "Give a name to your token"];
    }
  }
};
</script>