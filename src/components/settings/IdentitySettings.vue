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
            <v-btn
              flat
              :disabled="!walletdOk"
              @click.stop="$refs.identityImportDialog.show()"
            >Import</v-btn>
          </v-toolbar-items>
        </v-toolbar>

        <v-container fluid>
          <v-layout>
            <v-flex xs12>
              <v-treeview :items="identityTreeItems" item-key="name" open-on-click>
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
    <IdentityImportDialog ref="identityImportDialog"></IdentityImportDialog>
  </v-layout>
</template>

<script>
import IdentityImportDialog from "@/components/settings/IdentityImportDialog";
import { mapState } from "vuex";

export default {
  components: { IdentityImportDialog },
  data: function() {
    return {};
  },
  computed: {
    ...mapState({
      identities: state => state.identity.identities,
      identityKeysInWallet: state => state.identity.identityKeysInWallet
    }),
    walletdOk() {
      return this.$store.state.walletd.status === "ok";
    },
    identityTreeItems() {
      const that = this;
      return Object.keys(this.identities).map(function(chainId) {
        const keys = that.identities[chainId].map(key => ({
          name: key,
          available: that.identityKeysInWallet.has(key)
        }));
        // TODO
        // https://github.com/vuetifyjs/vuetify/issues/5531
        // Add available/total keys to the right + grey out unavailable keys
        // const totalKeys = keys.length;
        // const availableKeys = keys.filter(k => k.available).length;
        return {
          name: `${chainId}`,
          children: keys
        };
      });
    }
  },
  created() {
    this.$store.dispatch("identity/init");
  }
};
</script>


<style scoped>
</style>
