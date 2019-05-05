<template>
  <div>
    <Login></Login>
    <v-layout>
      <v-flex xs12 text-xs-right mt-5>
        <v-menu offset-y top left>
          <template v-slot:activator="{ on }">
            <v-btn icon v-on="on"> <v-icon>more_horiz</v-icon> </v-btn>
          </template>
          <v-list>
            <v-list-tile @click="$refs.newWalletNoticeDialog.show()">
              <v-list-tile-title>Create a new wallet</v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-menu>
      </v-flex>
    </v-layout>
    <NewWalletNoticeDialog ref="newWalletNoticeDialog" @newWallet="$emit('newWallet')"></NewWalletNoticeDialog>
  </div>
</template>

<script>
import Login from './Login';
import NewWalletNoticeDialog from './NewWalletNoticeDialog';

export default {
  components: { Login, NewWalletNoticeDialog }
};
</script>
