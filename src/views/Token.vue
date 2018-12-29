<template>
  <v-container>
    <v-layout row wrap class="section-margin-bottom">
      <TokenHeader :token="token"></TokenHeader>
    </v-layout>
    <template v-if="token.issuance">
      <v-layout row wrap class="section-margin-bottom">
        <AddressesBalances
          :type="token.issuance.type"
          :balances="balances"
          :symbol="token.issuance.symbol"
        ></AddressesBalances>
      </v-layout>
      <v-layout row wrap class="section-margin-bottom">
        <CreateTransaction
          :type="token.issuance.type"
          :balances="balances"
          :symbol="token.issuance.symbol"
        ></CreateTransaction>
      </v-layout>
    </template>
    <v-layout v-else row>
      <v-flex xs12 sm8 offset-sm2>
        <v-alert value="true" type="info" outline>This token has not yet been issued.</v-alert>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import TokenHeader from "@/components/TokenHeader";
import AddressesBalances from "@/components/AddressesBalances";
import CreateTransaction from "@/components/CreateTransaction";

export default {
  name: "Token",
  components: { TokenHeader, AddressesBalances, CreateTransaction },
  data() {
    return {
      balances: []
    };
  },
  computed: {
    chainId() {
      return this.$route.params.chainid;
    },
    token() {
      return this.$store.state.tokens.tracked[this.chainId];
    }
  },
  methods: {
    fetchBalances() {
      //const cli = this.$store.getters["fatd/cli"];
      this.balances = this.$store.getters["address/fctAddressesWithNames"].map(
        address =>
          Object.assign(address, {
            balance: parseFloat((Math.random() * 100).toFixed(10))
          })
      );
    }
  },
  watch: {
    token() {
      this.fetchBalances();
    }
  },
  mounted() {
    this.fetchBalances();
  }
};
</script>

<style scoped>
.section-margin-bottom {
  margin-bottom: 48px;
}
</style>
