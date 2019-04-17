<template>
  <v-container>
    <v-layout>
      <v-flex xs12 sm8 offset-sm2>
        <v-card>
          <v-form ref="form" v-model="valid" @submit.prevent="submit" lazy-validation>
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
                box
              ></v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn :disabled="!valid" type="submit" color="primary" :loading="loading">track</v-btn>
            </v-card-actions>
          </v-form>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
const HEX_REGEXP = /^[0-9a-fA-F]+$/;
import { tryParseApiErrorCode } from '@/components/common';

export default {
  data: () => ({
    valid: true,
    loading: false,
    tokenChainId: '',
    tokenChainIdRules: [
      v => !!v || 'Token chain ID is required',
      v => (v && v.length === 64) || 'Token chain ID must be 64 characters',
      v => (v && HEX_REGEXP.test(v)) || 'Invalid characters'
    ]
  }),

  methods: {
    async submit() {
      if (this.$refs.form.validate()) {
        this.loading = true;

        try {
          const cli = this.$store.getters['fatd/cli'];
          const tokenCli = await cli.getTokenCLI(this.tokenChainId);
          const issuance = await tokenCli.getIssuance();

          const token = {
            chainId: issuance.getTokenChainId(),
            issuer: issuance.getIssuerIdentityRootChainId(),
            tokenId: issuance.getTokenId(),
            entryHash: issuance.getEntryhash(),
            timestamp: issuance.getTimestamp(),
            type: issuance.getType(),
            symbol: issuance.getSymbol(),
            supply: issuance.getSupply()
          };

          this.$store.dispatch('tokens/track', { token, cli: tokenCli });
          this.$router.push({ path: `/token/${this.tokenChainId}?view=balances` });
        } catch (e) {
          const code = tryParseApiErrorCode(e);
          if (code === -32800) {
            this.$store.commit('snackError', 'Token not found.');
          } else {
            this.$store.commit('snackError', 'Unknown error encountered.');
            console.error(e);
          }
        } finally {
          this.loading = false;
        }
      }
    },
    clear() {
      this.$refs.form.reset();
    }
  }
};
</script>

<style scoped></style>
