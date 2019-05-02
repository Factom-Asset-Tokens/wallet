<template>
  <v-form @submit.prevent="changePassword" ref="form" lazy-validation>
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
              :rules="newPasswordRules"
              validate-on-blur
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
              :rules="newPasswordConfirmRules"
              validate-on-blur
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
      newPasswordRules: [v => (v && v.length >= 9) || 'Must be at least 9 character long'],
      displayNewPassword: false,
      newPasswordConfirm: '',
      displayNewPasswordConfirm: false
    };
  },
  computed: {
    newPasswordConfirmRules() {
      return [v => v === this.newPassword || 'Password confirmation does not match'];
    }
  },
  methods: {
    async changePassword() {
      if ((await this.validateCurrentPassword()) && this.$refs.form.validate()) {
        await this.$store.dispatch('keystore/changePassword', {
          oldPassword: this.currentPassword,
          newPassword: this.newPassword
        });

        this.$store.commit('snackSuccess', 'Wallet password changed');
        this.$refs.form.reset();
      }
    },
    async validateCurrentPassword() {
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

      return valid;
    }
  }
};
</script>

<style scoped></style>
