<template>
  <v-layout>
    <v-flex xs12>
      <v-card>
        <v-toolbar card color="primary">
          <v-icon large>fingerprint</v-icon>
          <v-toolbar-title>Digital Identities
            <v-btn flat icon color="white" @click="identityInfoDialog = true">
              <v-icon>help_outline</v-icon>
            </v-btn>
          </v-toolbar-title>

          <v-spacer></v-spacer>

          <v-toolbar-items>
            <v-btn
              flat
              :disabled="!identitySupport"
              @click.stop="$refs.createIdentityDialog.show()"
            >Create</v-btn>
            <v-btn
              flat
              :disabled="!identitySupport"
              @click.stop="$refs.identityImportDialog.show()"
            >Import</v-btn>
          </v-toolbar-items>
        </v-toolbar>

        <v-container fluid>
          <v-layout>
            <v-flex xs12>
              <div
                v-if="!identitySupport"
                class="font-italic subheading"
              >The version of factom-walletd you are connected to does not support digital identities.</div>
              <v-treeview v-else-if="hasIdentity" :items="identityTreeItems" item-key="name">
                <template slot="prepend" slot-scope="{ item, leaf }">
                  <v-icon v-if="!leaf">person</v-icon>
                  <v-icon
                    v-else-if="leaf && item.available"
                    color="green"
                    title="Secret key available in the wallet"
                  >vpn_key</v-icon>
                  <v-icon
                    v-else
                    color="grey"
                    title="Secret key NOT available in the wallet"
                    @click.stop="$refs.keyImportDialog.show(item.name)"
                  >vpn_key</v-icon>
                </template>
              </v-treeview>
              <div
                v-else
                class="font-italic subheading"
              >No digital identity currently saved in the wallet. You only need an identity if you wish to create or manage your own tokens.</div>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card>
    </v-flex>
    <IdentityImportDialog ref="identityImportDialog"></IdentityImportDialog>
    <CreateIdentityDialog ref="createIdentityDialog"></CreateIdentityDialog>
    <KeyImportDialog ref="keyImportDialog"></KeyImportDialog>
    <v-dialog
      v-model="identityInfoDialog"
      lazy
      max-width="800px"
      @keydown.esc="identityInfoDialog = false"
    >
      <v-card>
        <v-card-title
          class="headline primary white--text"
          primary-title
        >What are digital identities?</v-card-title>
        <v-card-text>
          <!-- TODO -->
          Explain what are digital identities. How they are used in FAT.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="identityInfoDialog = false">Got it</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import IdentityImportDialog from "./IdentitySettings/IdentityImportDialog";
import CreateIdentityDialog from "./IdentitySettings/CreateIdentityDialog";
import KeyImportDialog from "./IdentitySettings/KeyImportDialog";
import { mapState } from "vuex";

export default {
  components: { IdentityImportDialog, CreateIdentityDialog, KeyImportDialog },
  data: function() {
    return {
      identityInfoDialog: false
    };
  },
  computed: {
    ...mapState({
      identitySupport: state => state.walletd.identitySupport,
      identities: state => state.identity.identities,
      identityKeysInWallet: state => state.identity.identityKeysInWallet
    }),
    hasIdentity() {
      return Object.keys(this.identities).length > 0;
    },
    identityTreeItems() {
      const that = this;
      return Object.keys(this.identities)
        .sort()
        .map(function(chainId) {
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
  }
};
</script>


<style scoped>
</style>
