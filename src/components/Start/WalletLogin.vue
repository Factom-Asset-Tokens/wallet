<template>
  <v-form @submit.prevent="login">
    <v-layout wrap>
      <v-flex xs12 sm8 offset-sm2 text-xs-center>
        <v-text-field
          v-model="password"
          :append-icon="displayPassword ? 'visibility_off' : 'visibility'"
          :type="displayPassword ? 'text' : 'password'"
          @click:append="displayPassword = !displayPassword"
          label="Wallet Password"
          :error-messages="errorMessages"
          @input="errorMessages = []"
          autofocus
          single-line
          box
        ></v-text-field>
      </v-flex>
      <v-flex xs12 sm1 text-sm-left text-xs-center>
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
      <v-flex xs12 text-xs-center>
        <v-btn color="primary" large type="submit">
          <v-icon left>lock_open</v-icon>
          Unlock your wallet
        </v-btn>
      </v-flex>
      <v-dialog v-model="loading" persistent width="300">
        <v-card color="primary">
          <v-card-text>
            Unlocking your wallet...
            <v-progress-linear indeterminate color="white"></v-progress-linear>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-layout>
    <NewWalletNoticeDialog ref="newWalletNoticeDialog" @newWallet="$emit('newWallet')"></NewWalletNoticeDialog>
  </v-form>
</template>

<script>
import NewWalletNoticeDialog from './NewWalletNoticeDialog';

export default {
  components: { NewWalletNoticeDialog },
  data() {
    return {
      password: '',
      displayPassword: false,
      errorMessages: [],
      loading: false
    };
  },
  methods: {
    async login() {
      if (await this.validatePassword()) {
        try {
          this.loading = true;
          await this.$store.dispatch('initKeystoreMode', { password: this.password });
          this.$router.replace({ name: 'Factoid', query: { view: 'addresses' } });
          this.$store.commit('showAppSideBar');
        } catch (e) {
          this.$store.commit('snackError', e.message);
        } finally {
          this.loading = false;
        }
      }
    },
    async validatePassword() {
      if (!this.password) {
        this.errorMessages = ['Password is empty'];
        return false;
      }
      try {
        await this.$store.dispatch('keystore/testPassword', this.password);
        return true;
      } catch (e) {
        if (e.message.includes('Decryption failed')) {
          this.errorMessages = ['Incorrect password'];
        } else {
          this.$store.commit('snackError', e.message);
        }
      }
    }
  }
};
</script>

<style scoped></style>
