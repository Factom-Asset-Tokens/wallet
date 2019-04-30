<template>
  <v-form @submit.prevent="changePassword" ref="form">
    <v-sheet elevation="1">
      <v-container>
        <v-layout wrap>
          <v-flex xs12 sm8 offset-sm2 text-xs-center>
            <v-text-field
              v-model="currentPassword"
              :append-icon="displayCurrentPassword ? 'visibility_off' : 'visibility'"
              :type="displayCurrentPassword ? 'text' : 'password'"
              @click:append="displayCurrentPassword = !displayCurrentPassword"
              label="Current Password"
              :error-messages="currentPasswordErrors"
              @input="currentPasswordErrors = []"
              autofocus
              box
            ></v-text-field>
          </v-flex>
          <v-flex xs12 sm8 offset-sm2 text-xs-center>
            <v-text-field
              v-model="newPassword"
              :append-icon="displayNewPassword ? 'visibility_off' : 'visibility'"
              :type="displayNewPassword ? 'text' : 'password'"
              @click:append="displayNewPassword = !displayNewPassword"
              label="New Password"
              :error-messages="newPasswordErrors"
              @input="newPasswordErrors = []"
              box
            ></v-text-field>
          </v-flex>
          <v-flex xs12 sm8 offset-sm2 text-xs-center>
            <v-text-field
              v-model="newPasswordConfirm"
              :append-icon="displayNewPasswordConfirm ? 'visibility_off' : 'visibility'"
              :type="displayNewPasswordConfirm ? 'text' : 'password'"
              @click:append="displayNewPasswordConfirm = !displayNewPasswordConfirm"
              label="New Password (confirmation)"
              :error-messages="newPasswordConfirmErrors"
              @input="newPasswordConfirmErrors = []"
              box
            ></v-text-field>
          </v-flex>
          <v-flex xs12 text-xs-center mt-3>
            <v-btn color="primary" large type="submit">
              Change wallet password
            </v-btn>
          </v-flex>
        </v-layout>
      </v-container>
    </v-sheet>
  </v-form>
</template>

<script>
export default {
  name: 'PasswordChange',
  data: function() {
    return {
      loading: false,
      currentPassword: '',
      displayCurrentPassword: false,
      currentPasswordErrors: [],
      newPassword: '',
      displayNewPassword: false,
      newPasswordErrors: [],
      newPasswordConfirm: '',
      displayNewPasswordConfirm: false,
      newPasswordConfirmErrors: []
    };
  },
  methods: {
    async changePassword() {
      if (await this.validatePasswordChange()) {
        await this.$store.dispatch('keystore/changePassword', {
          oldPassword: this.currentPassword,
          newPassword: this.newPassword
        });

        this.$store.commit('snackSuccess', 'Wallet password changed');
        this.$refs.form.reset();
      }
    },
    async validatePasswordChange() {
      let valid = true;

      if (!this.currentPassword) {
        this.currentPasswordErrors = ['Password is empty'];
        valid = false;
      } else {
        try {
          await this.$store.dispatch('keystore/testPassword', this.currentPassword);
        } catch (e) {
          if (e.message.includes('Decryption failed')) {
            this.currentPasswordErrors = ['Incorrect password'];
            valid = false;
          } else {
            this.$store.commit('snackError', e.message);
          }
        }
      }

      if (!this.newPassword) {
        this.newPasswordErrors = ['Password is empty'];
        valid = false;
      }

      if (this.newPassword !== this.newPasswordConfirm) {
        this.newPasswordConfirmErrors = ['Password confirmation does not match'];
        valid = false;
      }

      return valid;
    }
  }
};
</script>

<style scoped></style>
