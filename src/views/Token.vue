<template>
  <div v-if="token && canManageFatTokens">
    <Fat0Token v-if="token.type === 'FAT-0'" :token="token" :tokenCli="tokenCli"></Fat0Token>
    <Fat1Token v-else-if="token.type === 'FAT-1'" :token="token" :tokenCli="tokenCli"></Fat1Token>
  </div>
  <v-container v-else-if="!canManageFatTokens">
    <v-layout>
      <v-flex xs12>
        <v-alert value="true" type="error" class="title" outline
          >The configuration of fatd or factomd is incorrect. Go to the settings to fix them.
        </v-alert>
      </v-flex>
    </v-layout>
  </v-container>
  <v-container v-else>
    <v-layout>
      <v-flex xs12>
        <v-alert value="true" type="error" class="title" outline>This token is not currently tracked.</v-alert>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import Fat0Token from '@/components/Token/Fat0Token';
import Fat1Token from '@/components/Token/Fat1Token';

import AvailableFeatures from '@/mixins/AvailableFeatures';

export default {
  name: 'Token',
  components: { Fat0Token, Fat1Token },
  mixins: [AvailableFeatures],
  computed: {
    canManageFatTokens() {
      return this.availableFeatures('fatd', 'factomd');
    },
    chainId() {
      return this.$route.params.chainid;
    },
    tokenCli() {
      return this.$store.state.tokens.clis[this.chainId];
    },
    token() {
      return this.$store.state.tokens.tracked[this.chainId];
    }
  }
};
</script>

<style scoped></style>
