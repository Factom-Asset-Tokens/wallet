<template>
  <v-layout>
    <v-flex xs12>
      <v-card>
        <v-toolbar card color="primary">
          <v-icon large>fingerprint</v-icon>
          <v-toolbar-title
            >Digital Identities
            <v-btn flat icon color="white" @click="identityInfoDialog = true">
              <v-icon>help_outline</v-icon>
            </v-btn>
          </v-toolbar-title>

          <v-spacer></v-spacer>

          <v-toolbar-items>
            <v-btn flat :disabled="disableIdentityOperations" @click.stop="$refs.createIdentityDialog.show()"
              >Create</v-btn
            >
            <v-btn flat :disabled="disableIdentityOperations" @click.stop="$refs.identityImportDialog.show()"
              >Import</v-btn
            >
          </v-toolbar-items>
        </v-toolbar>

        <v-container fluid>
          <v-layout>
            <v-flex xs12>
              <IdentityTree v-if="hasIdentity"></IdentityTree>
              <div v-else class="font-italic subheading">
                No digital identity currently saved in the wallet. You only need an identity if you wish to create or
                manage your own tokens.
              </div>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card>
    </v-flex>
    <IdentityImportDialog ref="identityImportDialog"></IdentityImportDialog>
    <CreateIdentityDialog ref="createIdentityDialog"></CreateIdentityDialog>
    <v-dialog
      v-model="identityInfoDialog"
      lazy
      max-width="800px"
      @keydown.esc="identityInfoDialog = false"
      @keydown.enter="identityInfoDialog = false"
    >
      <v-card>
        <v-card-title class="headline primary white--text" primary-title>What are digital identities?</v-card-title>
        <v-card-text class="subheading">
          <div>
            Digital identities are identities registered on the Factom blockchain and referenced by their chain ID. A
            set of ed25519 key pairs is associated with an identities. Those keys can be used to sign and authenticate
            data.
          </div>
          <div>
            Digital identities are used in the FAT protocol context to issue new tokens and manage tokens supply.
          </div>
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
import IdentityImportDialog from './IdentitySettings/IdentityImportDialog';
import CreateIdentityDialog from './IdentitySettings/CreateIdentityDialog';
import IdentityTree from './IdentitySettings/IdentityTree';
import { mapState } from 'vuex';
import AvailableFeatures from '@/mixins/AvailableFeatures';

export default {
  components: { IdentityImportDialog, CreateIdentityDialog, IdentityTree },
  mixins: [AvailableFeatures],
  data: function() {
    return {
      identityInfoDialog: false
    };
  },
  mounted() {
    this.$store.dispatch('identity/init');
  },
  computed: {
    ...mapState({
      identities: state => state.identity.identities
    }),
    disableIdentityOperations() {
      return !this.availableFeatures('factomd');
    },
    hasIdentity() {
      return Object.keys(this.identities).length > 0;
    }
  }
};
</script>

<style scoped></style>
