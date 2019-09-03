<template>
  <v-form lazy-validation v-model="valid" ref="form" @submit.prevent="validate">
    <v-card>
      <v-card-title primary-title class="secondary--text display-1">
        <v-flex text-xs-center>Wallet password</v-flex>
      </v-card-title>
      <v-card-text>
        <v-layout wrap mb-3>
          <v-flex xs12 my-5>
            <blockquote class="blockquote">
              Choose a unique and secure password. It must be at least 8 character long, any character is allowed.
              <span class="secondary--text font-weight-medium">DO NOT FORGET</span> your password, you will need it to
              log into your wallet.
            </blockquote>
          </v-flex>
          <v-flex xs12 sm8 offset-sm2 text-xs-center>
            <v-text-field
              v-model="password"
              :append-icon="displayPassword ? 'visibility_off' : 'visibility'"
              :type="displayPassword ? 'text' : 'password'"
              @click:append="displayPassword = !displayPassword"
              label="Password"
              :rules="passwordRules"
              validate-on-blur
              autofocus
              box
            ></v-text-field>
          </v-flex>
          <v-flex xs12 sm8 offset-sm2 text-xs-center>
            <v-text-field
              v-model="passwordConfirm"
              :append-icon="displayPasswordConfirm ? 'visibility_off' : 'visibility'"
              :type="displayPasswordConfirm ? 'text' : 'password'"
              @click:append="displayPasswordConfirm = !displayPasswordConfirm"
              label="Password Confirmation"
              :rules="passwordConfirmRules"
              validate-on-blur
              box
            ></v-text-field>
          </v-flex>
        </v-layout>
      </v-card-text>
      <v-card-actions>
        <v-btn flat @click="$emit('back')">Back</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="primary" type="submit" :disabled="!valid">Continue</v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<script>
export default {
  name: 'SetPassword',
  data() {
    return {
      valid: true,
      password: '',
      displayPassword: false,
      passwordConfirm: '',
      displayPasswordConfirm: false,
      passwordRules: [v => v.length >= 8 || 'Must be at least 8 character long'],
      passwordConfirmRules: [v => v === this.password || 'Does not match password']
    };
  },
  methods: {
    validate() {
      if (this.$refs.form.validate()) {
        this.$emit('update:password', this.password);
        this.$emit('next');
      }
    }
  }
};
</script>

<style scoped></style>
