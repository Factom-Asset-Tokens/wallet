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
        <WalletLogin v-if="showLogin" @newWallet="showNewWalletSelection()"></WalletLogin>
        <NewWalletSelection v-else></NewWalletSelection>
      </v-container>
      <KeystoreMissingDialog :keystorePath="keystorePath" ref="keystoreMissingDialog"></KeystoreMissingDialog>
    </v-sheet>
  </v-container>
</template>

<script>
import fs from 'fs';
import WalletLogin from '@/components/Start/WalletLogin';
import NewWalletSelection from '@/components/Start/NewWalletSelection';
import KeystoreMissingDialog from '@/components/Start/KeystoreMissingDialog';

export default {
  name: 'Start',
  components: { WalletLogin, NewWalletSelection, KeystoreMissingDialog },
  data() {
    return {
      showLogin: false
    };
  },
  computed: {
    keystorePath() {
      return this.$store.state.keystore.filename;
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
  methods: {
    showNewWalletSelection() {
      this.showLogin = false;
    }
  },
  mounted() {
    if (this.accessibleKeyStore) {
      this.showLogin = true;
    } else if (this.keystorePath && !this.accessibleKeyStore) {
      this.$refs.keystoreMissingDialog.show();
    }
  }
};
</script>

<style scoped>
.header-margin {
  margin-bottom: 80px;
}
</style>
