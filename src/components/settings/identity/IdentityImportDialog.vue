<template>
  <v-dialog v-model="display" lazy max-width="800px" @keydown.esc="display = false">
    <v-stepper v-model="step">
      <v-stepper-header>
        <v-stepper-step :complete="step > 1" step="1">Identity chain</v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step :complete="step > 2" step="2">Identity keys</v-stepper-step>
      </v-stepper-header>

      <v-stepper-items>
        <v-stepper-content step="1">
          <v-card>
            <v-form v-model="validStep1" ref="formStep1" @submit.prevent="nextStep" lazy-validation>
              <v-card-text>
                <v-container>
                  <v-layout wrap>
                    <v-flex xs12>
                      <v-text-field
                        ref="identityChainId"
                        autofocus
                        v-model="identityChainId"
                        label="Identity Chain Id"
                        counter="64"
                        :rules="chainIdRules"
                        required
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs12 mt-4>
                      <v-alert
                        :value="loadingError"
                        color="error"
                        icon="warning"
                        outline
                      >{{loadingError}}</v-alert>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="primary"
                  :loading="loadingActiveKeys"
                  :disabled="!validStep1 || loadingActiveKeys"
                  type="submit"
                >Continue</v-btn>
              </v-card-actions>
            </v-form>
          </v-card>
        </v-stepper-content>

        <v-stepper-content step="2">
          <v-card>
            <v-form v-model="validStep2" ref="formStep2" @submit.prevent="importIdentity" lazy-validation>
              <v-card-text>
                <v-list subheader>
                  <v-subheader inset>Associated identity keys</v-subheader>

                  <v-list-tile
                    v-for="identityPublicKey in identityActivePublicKeys"
                    :key="identityPublicKey"
                    avatar
                  >
                    <v-list-tile-avatar>
                      <v-icon v-if="importedPublicKeys.has(identityPublicKey)" color="green">vpn_key</v-icon>
                      <v-icon v-else color="grey">vpn_key</v-icon>
                    </v-list-tile-avatar>

                    <v-list-tile-content>
                      <v-list-tile-title>{{ identityPublicKey }}</v-list-tile-title>
                    </v-list-tile-content>
                  </v-list-tile>
                </v-list>
                <div v-if="missingIdentityKeys.size !== 0">
                  <p class="bold">
                    {{missingIdentityKeys.size}}/{{identityActivePublicKeys.length}} identity keys are not stored in the wallet.
                    <br>You can import the corresponding secret identity keys below.
                  </p>
                  <SecretKeyInput
                    v-for="(privateKey, index) in addedPrivateKeys"
                    :key="index"
                    v-model="addedPrivateKeys[index]"
                    :validationRules="secretKeyValidationRules"
                  ></SecretKeyInput>
                </div>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" flat outline @click="backStep()">Back</v-btn>
                <v-btn color="primary" :disabled="!validStep2" type="submit">Import</v-btn>
              </v-card-actions>
            </v-form>
          </v-card>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
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
      display: false,
      step: 1,
      // Step 1
      loadingActiveKeys: false,
      loadingError: "",
      identityChainId: "",
      validStep1: true,
      chainIdRules: [v => (v && v.length === 64) || "Invalid chain id"],
      // Step 2
      validStep2: true,
      identityActivePublicKeys: [],
      addedPrivateKeys: []
    };
  },
  computed: {
    importedPublicKeys() {
      const addedPublicKeys = this.addedPrivateKeys
        .filter(isValidSecretIdentityKey)
        .map(getPublicIdentityKey);
      const keysInWallet = this.$store.state.identity.identityKeysInWallet;
      return new Set([...keysInWallet, ...addedPublicKeys]);
    },
    missingIdentityKeys() {
      const keysInWallet = this.$store.state.identity.identityKeysInWallet;
      return new Set(
        this.identityActivePublicKeys.filter(k => !keysInWallet.has(k))
      );
    },
    secretKeyValidationRules() {
      const missingKeys = this.missingIdentityKeys;
      return [
        v =>
          !v ||
          (isValidSecretIdentityKey(v) &&
            missingKeys.has(getPublicIdentityKey(v))) ||
          "Not a secret key missing for this identity"
      ];
    }
  },
  methods: {
    show() {
      this.display = true;
    },
    backStep() {
      this.step = 1;
      this.identityActivePublicKeys = [];
      this.$refs.formStep2.reset();
    },
    async nextStep() {
      if (this.$refs.formStep1.validate()) {
        this.loadingActiveKeys = true;
        this.loadingError = "";
        try {
          const manager = this.$store.getters["identity/manager"];
          this.identityActivePublicKeys = await manager.getActivePublicIdentityKeys(
            this.identityChainId
          );
          this.addedPrivateKeys = Array(this.missingIdentityKeys.size).fill("");
          this.step = 2;
        } catch (e) {
          this.loadingError =
            "Failed to retrieve identity information. Is it an identity chain?";
        } finally {
          this.loadingActiveKeys = false;
        }
      }
    },
    importIdentity() {
      if (this.$refs.formStep2.validate()) {
        const identity = {};
        identity[this.identityChainId] = this.identityActivePublicKeys.slice();
        this.$store.commit("identity/addIdentity", identity);
        const keysToImport = this.addedPrivateKeys.filter(pk => pk);
        this.$store.dispatch("identity/importIdentityKeys", keysToImport);
        this.display = false;
      }
    }
  },
  watch: {
    display() {
      if (this.display) {
        this.step = 1;
        if (this.$refs.formStep1) {
          this.$refs.formStep1.reset();
        }
        if (this.$refs.formStep2) {
          this.$refs.formStep2.reset();
        }
        this.loadingError = "";
        this.identityActivePublicKeys = [];
        if (this.$refs.identityChainId) {
          this.$nextTick(this.$refs.identityChainId.focus);
        }
      }
    }
  }
};
</script>


<style scoped>
.bold {
  font-weight: bold;
  text-align: center;
  margin: 36px;
  font-size: large;
}
</style>
