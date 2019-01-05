<template>
  <v-container>
    <v-layout>
      <v-flex xs12 sm8 offset-sm2>
        <v-card>
          <v-form ref="form" v-model="valid" @submit="submit" lazy-validation>
            <v-card-title>
              <span class="headline">Track an existing token</span>
            </v-card-title>
            <v-card-text>
              <v-text-field
                v-model.trim="tokenChainId"
                :rules="tokenChainIdRules"
                label="Token chain ID"
                counter="64"
                len
                required
                autofocus
              ></v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-btn :disabled="!valid" type="submit">track</v-btn>
              <v-btn @click="clear">clear</v-btn>
            </v-card-actions>
          </v-form>
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
const HEX_REGEXP = /^[0-9a-fA-F]+$/;

export default {
  data: () => ({
    snackError: false,
    snackErrorMessage: "",
    valid: true,
    tokenChainId: "",
    tokenChainIdRules: [
      v => !!v || "Token chain ID is required",
      v => (v && v.length === 64) || "Token chain ID must be 64 characters",
      v => (v && HEX_REGEXP.test(v)) || "Invalid characters"
    ]
  }),

  methods: {
    async submit(e) {
      e.preventDefault();

      if (this.$refs.form.validate()) {
        const cli = this.$store.getters["fatd/cli"];
        const tokenCli = cli.getTokenCLI(this.tokenChainId);

        try {
          const result = await tokenCli.getIssuance();

          const token = {
            chainId: result.chainid,
            issuer: result.issuerid,
            tokenId: result.tokenid,
            issuance: result.issuance
          };

          this.$store.commit("tokens/trackToken", token);
          this.$router.push({ path: `/token/${this.tokenChainId}` });
        } catch (e) {
          const code = JSON.parse(e.message).code;
          if (code === -32800) {
            this.snackErrorMessage = "Token not found.";
          } else {
            this.snackErrorMessage = "Unknown error encountered.";
            console.error(e);
          }
          this.snackError = true;
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
