<template>
  <v-container>
    <template v-if="token">
      <v-layout row wrap class="section-margin-bottom">
        <TokenHeader :token="token"></TokenHeader>
      </v-layout>

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
        <v-alert value="true" type="error" outline>This token is not tracked.</v-alert>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import TokenHeader from "@/components/TokenHeader";
import AddressesBalances from "@/components/AddressesBalances";
import CreateTransaction from "@/components/CreateTransaction";
import Promise from "bluebird";

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
    fatdCli() {
      const cli = this.$store.getters["fatd/cli"];
      return cli.getTokenCLI(this.chainId);
    },
    token() {
      return this.$store.state.tokens.tracked[this.chainId];
    }
  },
  methods: {
    async fetchBalances() {
      const fatdCli = this.fatdCli;
      const addresses = this.$store.getters["address/fctAddressesWithNames"];

      this.balances = await Promise.map(addresses, async function(address) {
        const balance = await fatdCli.getBalance(address.address);
        return Object.assign({ balance }, address);
      });
    }
  },
  watch: {
    token() {
      this.balances = [];
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
