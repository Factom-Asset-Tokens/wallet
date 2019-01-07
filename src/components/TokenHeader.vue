<template>
  <v-flex xs12 sm8 offset-sm2>
    <v-card>
      <v-card-text>
        <v-layout align-center justify-center wrap>
          <v-flex xs12 text-xs-center mb-4>
            <v-avatar :size="64" color="grey lighten-4">
              <img :src="icon" alt="Token icon">
            </v-avatar>
          </v-flex>

          <v-flex class="display-1" xs12 text-xs-center>
            {{name}}
            <template v-if="symbol">({{symbol}})</template>
          </v-flex>
        </v-layout>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn icon @click="showDetails = !showDetails">
          <v-icon>{{ showDetails ? 'keyboard_arrow_down' : 'keyboard_arrow_up' }}</v-icon>
        </v-btn>
      </v-card-actions>

      <v-slide-y-transition>
        <v-container v-show="showDetails">
          <v-layout wrap>
            <v-flex xs12 my-2>Chain ID: {{token.chainId}}</v-flex>
            <TokenSupplyDetails :chainId="token.chainId" :symbol="token.issuance.symbol"></TokenSupplyDetails>
            <v-flex xs12 text-xs-right>
              <v-btn color="primary" @click="untrack">untrack</v-btn>
            </v-flex>
          </v-layout>
        </v-container>
      </v-slide-y-transition>
    </v-card>
  </v-flex>
</template>

<script>
import TokenSupplyDetails from "@/components/TokenSupplyDetails";

export default {
  name: "TokenHeader",
  components: { TokenSupplyDetails },
  data() {
    return {
      showDetails: false
    };
  },
  props: ["token"],
  computed: {
    icon() {
      return this.token.metadata && this.token.metadata.iconSrc
        ? this.token.metadata.iconSrc
        : "/img/token-no-icon.png";
    },
    name() {
      return this.token.issuance.name
        ? this.token.issuance.name
        : this.token.tokenId;
    },
    symbol() {
      return this.token.issuance.symbol || "";
    },
    description() {
      return this.token.issuance.description;
    }
  },
  methods: {
    untrack() {
      this.$store.commit("tokens/untrack", this.token.chainId);
      this.$router.push({ name: "Actions" });
    }
  }
};
</script>

<style scoped>
</style>
