<template>
  <v-container>
    <v-layout>
      <v-flex xs12 sm8 offset-sm2>
        <v-card>
          <v-card-title>
            <span class="headline">Track an existing token</span>
          </v-card-title>
          <v-card-text>
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-text-field
                v-model.trim="tokenChainId"
                :rules="tokenChainIdRules"
                label="Token chain ID"
                counter="64"
                len
                required
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn :disabled="!valid" @click="submit">track</v-btn>
            <v-btn @click="clear">clear</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
    <v-snackbar v-model="snackError" color="error" :timeout="5000">
      {{ snackErrorMessage }}
      <v-btn dark flat @click="snackError = false">Close</v-btn>
    </v-snackbar>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    snackError: false,
    snackErrorMessage: '',
    valid: true,
    tokenChainId: "",
    tokenChainIdRules: [
      v => !!v || "Token chain ID is required",
      v => (v && v.length === 64) || "Token chain ID must be 64 characters"
    ]
  }),

  methods: {
    async submit() {
      if (this.$refs.form.validate()) {
        const cli = this.$store.getters["fatd/cli"];
        const tokenCli = cli.getTokenCLI(this.tokenChainId);
        const result = await tokenCli.getIssuance();

        if (result) {
          const token = {
            chainId: result.chainid,
            issuer: result.issuerid,
            tokenId: result.tokenid,
            issuance: result.issuance
          }

          this.$store.commit("tokens/trackToken", token);
          this.$router.push({ path: `/token/${this.tokenChainId}` });
        } else {
          this.snackError = true;
          this.snackErrorMessage = `Failed to retrieve token issuance.`;
        }
      }
    },
    clear() {
      this.$refs.form.reset();
    }
  }
};
</script>

<style scoped>
</style>
