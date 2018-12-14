<template>
  <v-layout>
    <v-flex xs12>
      <v-card>
        <v-toolbar card>
          <v-icon large>fingerprint</v-icon>
          <v-toolbar-title>Digital Identities</v-toolbar-title>

          <v-spacer></v-spacer>

          <v-toolbar-items>
            <v-btn flat :disabled="!walletdOk">Create</v-btn>
            <v-btn flat :disabled="!walletdOk">Import</v-btn>
          </v-toolbar-items>
        </v-toolbar>

        <v-container fluid>
          <v-layout>
            <v-flex xs12>
              <v-treeview :items="identityTreeItems" item-key="name" open-on-click>
                <!-- Grey out unavailable keys once this is implemented: https://github.com/vuetifyjs/vuetify/issues/5531 -->
                <template slot="prepend" slot-scope="{ item, leaf }">
                  <v-icon v-if="!leaf">person</v-icon>
                  <v-icon
                    v-else-if="leaf && item.available"
                    color="green"
                    title="Secret key available in the wallet"
                  >vpn_key</v-icon>
                  <v-icon v-else color="grey" title="Secret key NOT available in the wallet">vpn_key</v-icon>
                </template>
              </v-treeview>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  data: function() {
    return {
      identityChains: {
        f2c3195baad460c7ddaed73b58338ccef4046c04f7b27408c8152f20f277cc72: [
          "idpub2eubg6p18fefnHPW2Z42Wyre8LwqmRbHpkaEfEmJ213cUo8u7w",
          "idpub3Doj5fqXye8PkX8w83hzPh3PXbiLhrxTZjT6sXmtFQdDyzwymz"
        ]
      },
      identityKeysInWallet: new Set([
        "idpub3Doj5fqXye8PkX8w83hzPh3PXbiLhrxTZjT6sXmtFQdDyzwymz"
      ])
    };
  },

  computed: {
    walletdOk() {
      return this.$store.state.walletd.status === "ok";
    },
    identityTreeItems() {
      const that = this;
      return Object.keys(this.identityChains).map(function(chainId) {
        const keys = that.identityChains[chainId].map(key => ({
          name: key,
          available: that.identityKeysInWallet.has(key)
        }));
        return {
          name: chainId,
          children: keys
        };
      });
    }
  }
};
</script>


<style scoped>
</style>
