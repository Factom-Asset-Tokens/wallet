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
        <WalletLogin v-if="hasKeyStore"></WalletLogin>
        <NewWalletSelection v-else></NewWalletSelection>
      </v-container>
    </v-sheet>
  </v-container>
</template>

<script>
import Store from 'electron-store';
import WalletLogin from '@/components/Start/WalletLogIn';
import NewWalletSelection from '@/components/Start/NewWalletSelection';

const userConfig = new Store({ name: 'user-config.v1' });

export default {
  name: 'Start',
  components: { WalletLogin, NewWalletSelection },
  computed: {
    hasKeyStore() {
      return !!userConfig.get('state.keystore.filename');
    }
  }
};
</script>

<style scoped>
.header-margin {
  margin-bottom: 100px;
}
</style>
