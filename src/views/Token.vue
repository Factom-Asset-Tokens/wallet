<template>
  <v-container grid-list-xl>
    <TokenHeader :token="token"></TokenHeader>
    <AddressesBalances :token="token"></AddressesBalances>
  </v-container>
</template>

<script>
import TokenHeader from "@/components/TokenHeader";
import AddressesBalances from "@/components/AddressesBalances";

export default {
  name: "Token",
  components: { TokenHeader, AddressesBalances },
  computed: {
    chainId() {
      return this.$route.params.chainid;
    },
    token() {
      return this.$store.state.tokens.tracked[this.chainId];
    }
  }
};
</script>

<style scoped>
</style>
