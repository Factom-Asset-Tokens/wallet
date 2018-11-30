<template>
  <v-flex xs12 sm8 offset-sm2>
    <v-card>
      <v-card-text>
        <v-layout align-center justify-center row fill-height>
          <v-avatar :size="64" color="grey lighten-4">
            <img :src="icon" alt="Token icon">
          </v-avatar>

          <h1>
            {{name}}
            <template v-if="symbol">({{symbol}})</template>
          </h1>
        </v-layout>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn icon @click="showDetails = !showDetails">
          <v-icon>{{ showDetails ? 'keyboard_arrow_down' : 'keyboard_arrow_up' }}</v-icon>
        </v-btn>
      </v-card-actions>

      <v-slide-y-transition>
        <v-card-text v-show="showDetails">{{description}}</v-card-text>
      </v-slide-y-transition>
    </v-card>
  </v-flex>
</template>

<script>
export default {
  name: "TokenHeader",
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
        : "https://png.icons8.com/dotty/40/000000/help.png";
    },
    name() {
      return this.token.issuance && this.token.issuance.name
        ? this.token.issuance.name
        : this.token.tokenId;
    },
    symbol() {
      return this.token.issuance && this.token.issuance.symbol
        ? this.token.issuance.symbol
        : "";
    },
    description() {
      return this.token.issuance && this.token.issuance.description
        ? this.token.issuance.description
        : "No description available";
    }
  }
};
</script>

<style scoped>
</style>
