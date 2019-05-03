<template>
  <v-dialog v-model="display" lazy max-width="600px" @keydown.esc="display = false">
    <v-card v-if="this.seed.length > 0">
      <v-card-title class="headline primary white--text" primary-title>Recovery Phrase</v-card-title>
      <v-card-text>
        <v-container grid-list-xl>
          <v-layout wrap>
            <v-flex v-for="(word, index) in seed" :key="index" xs6 sm4>
              <v-chip class="title" outline color="secondary">{{ index + 1 }}. {{ word }}</v-chip>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="display = false">Noted</v-btn>
      </v-card-actions>
    </v-card>
    <v-card v-else>
      <v-form @submit.prevent="reveal">
        <v-card-title class="headline primary white--text" primary-title>Recovery Phrase</v-card-title>
        <v-card-text>
          <v-layout wrap>
            <v-flex xs12 mb-4>
              <p class="subheading">
                Make sure your screen is not visible to others around you or in public. Anyone with your Recovery Phrase
                can access or spend your funds.
              </p>
            </v-flex>
            <v-flex xs12 text-xs-center>
              <v-text-field
                v-model="password"
                ref="password"
                :append-icon="displayPassword ? 'visibility_off' : 'visibility'"
                :type="displayPassword ? 'text' : 'password'"
                @click:append="displayPassword = !displayPassword"
                label="Wallet Password"
                :error-messages="errorMessages"
                @input="errorMessages = []"
                autofocus
                box
              ></v-text-field>
            </v-flex>
          </v-layout>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" type="submit">Reveal Recovery Phrase</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data: function() {
    return {
      password: '',
      displayPassword: false,
      errorMessages: [],
      display: false,
      seed: []
    };
  },
  methods: {
    show() {
      this.display = true;
      if (this.$refs.password) {
        this.$nextTick(this.$refs.password.focus);
      }
    },
    reveal() {
      if (this.password === '') {
        this.errorMessages = ['Incorrect password'];
        return;
      }
      try {
        this.seed = this.$store.state.keystore.store.getMnemonic(this.password).split(' ');
      } catch (e) {
        if (e.message.includes('Decryption failed')) {
          this.errorMessages = ['Incorrect password'];
        } else {
          this.$store.commit('snackError', e.message);
        }
      }
    }
  },
  watch: {
    async display() {
      if (!this.display) {
        this.password = '';
        setTimeout(() => (this.seed = []), 300);
      }
    }
  }
};
</script>
