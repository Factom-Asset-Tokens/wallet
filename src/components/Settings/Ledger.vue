<template>
  <v-sheet elevation="1">
    <v-container>
      <v-layout wrap>
        <v-flex xs12>
          <v-checkbox
            v-model="legacyDerivation"
            color="primary"
            label="Use legacy derivation path. Use this option to access addresses generated with an old version (<=v1.0.2) of the FAT Wallet. The wallet will be closed to apply the change."
          ></v-checkbox>
        </v-flex>
      </v-layout>
    </v-container>
  </v-sheet>
</template>

<script>
const { app } = require('electron').remote;

export default {
  name: 'LedgerSettings',
  data: function() {
    return {};
  },
  computed: {
    legacyDerivation: {
      get() {
        return this.$store.state.ledger.legacyDerivation;
      },
      set(value) {
        this.$store.commit('ledger/setLegacyDerivation', value);
        // Small delay to be sure the commit above has time to be asynchroniusly replicated on disk
        setTimeout(() => app.exit(0), 50);
      }
    }
  }
};
</script>

<style scoped></style>
