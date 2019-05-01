<template>
  <v-container>
    <v-sheet elevation="2">
      <v-container>
        <v-layout wrap class="header-margin">
          <v-flex xs12 my-4 text-xs-center class="secondary--text">
            <div class="display-2 font-weight-light">Welcome to the</div>
            <div class="display-2 font-weight-light">Factom Asset Token Wallet</div>
          </v-flex>
          <v-flex xs12 text-xs-center>
            <img src="@/assets/img/fat-icon.png" width="100px" />
          </v-flex>
        </v-layout>
        <WalletLogin v-if="accessibleKeyStore"></WalletLogin>
        <NewWalletSelection v-else></NewWalletSelection>
      </v-container>
      <KeystoreMissingDialog :keystorePath="keystorePath" ref="keystoreMissingDialog"></KeystoreMissingDialog>
    </v-sheet>
  </v-container>
</template>

<script>
import fs from 'fs';
import Store from 'electron-store';
import WalletLogin from '@/components/Start/WalletLogIn';
import NewWalletSelection from '@/components/Start/NewWalletSelection';
import KeystoreMissingDialog from '@/components/Start/KeystoreMissingDialog';

const userConfig = new Store({ name: 'user-config.v1' });

export default {
  name: 'Start',
  components: { WalletLogin, NewWalletSelection, KeystoreMissingDialog },
  computed: {
    keystorePath() {
      return userConfig.get('state.keystore.filename');
    },
    accessibleKeyStore() {
      if (this.keystorePath) {
        try {
          fs.accessSync(this.keystorePath, fs.constants.R_OK | fs.constants.W_OK);
          return true;
        } catch (err) {
          return false;
        }
      }
      return false;
    }
  },
  mounted() {
    if (this.keystorePath && !this.accessibleKeyStore) {
      this.$refs.keystoreMissingDialog.show();
    }
  }
};
</script>

<style scoped>
.header-margin {
  margin-bottom: 100px;
}
</style>
