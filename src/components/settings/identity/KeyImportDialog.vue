<template>
  <v-dialog v-model="display" lazy max-width="800px" @keydown.esc="display = false">
    <v-form v-model="valid" lazy-validation ref="form" @submit.prevent="importKey">
      <v-card>
        <v-card-title>
          <span class="headline">Import Identity Key</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-layout wrap>
              <v-flex xs12>
                Import the secret key matching
                <strong class="primary--text">{{publicKey}}</strong>
              </v-flex>
              <v-flex xs12>
                <SecretKeyInput
                  ref="secretKeyInput"
                  v-model="secretKey"
                  :validationRules="secretKeyValidationRules"
                ></SecretKeyInput>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" flat outline @click="display = false">Close</v-btn>
          <v-btn color="primary" type="submit" :disabled="!valid">Import</v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script>
import SecretKeyInput from "@/components/settings/identity/SecretKeyInput";
import { digital } from "factom-identity-lib";
const { getPublicIdentityKey, isValidSecretIdentityKey } = digital;

export default {
  components: { SecretKeyInput },
  data: function() {
    return {
      publicKey: "",
      display: false,
      valid: true,
      importLoading: false,
      secretKey: ""
    };
  },
  computed: {
    secretKeyValidationRules() {
      const publicKey = this.publicKey;
      return [
        v => !!v || "Must not be empty",
        v =>
          !v ||
          (isValidSecretIdentityKey(v) &&
            getPublicIdentityKey(v) === publicKey) ||
          "Secret key does not match the public key"
      ];
    }
  },
  methods: {
    show(publicKey) {
      this.display = true;
      this.publicKey = publicKey;
    },
    importKey() {
      if (this.$refs.form.validate()) {
        this.$store.dispatch("identity/importIdentityKeys", [this.secretKey]);
        this.display = false;
      }
    }
  },
  watch: {
    display() {
      if (this.display) {
        if (this.$refs.secretKeyInput) {
          this.$nextTick(this.$refs.secretKeyInput.focus);
        }
      } else {
        this.$refs.form.reset();
      }
    }
  }
};
</script>