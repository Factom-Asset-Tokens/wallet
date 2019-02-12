<template>
  <v-container>
    <template v-if="token">
      <v-layout row wrap mb-5>
        <TokenHeader :token="token" :totalBalance="totalBalance"></TokenHeader>
      </v-layout>

      <v-layout row wrap mb-4>
        <AddressesBalances
          :type="token.issuance.type"
          :balances="balances"
          :symbol="token.issuance.symbol"
          :tokenCli="tokenCli"
        ></AddressesBalances>
      </v-layout>
      <v-layout row wrap>
        <CreateTransaction
          :type="token.issuance.type"
          :balances="balances"
          :symbol="token.issuance.symbol"
          :tokenCli="tokenCli"
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
import { standardizeId } from "@/components/fat1/ids-utils.js";

export default {
  name: "Token",
  components: { TokenHeader, AddressesBalances, CreateTransaction },
  data() {
    return {
      balances: [],
      intervalId: 0
    };
  },
  computed: {
    chainId() {
      return this.$route.params.chainid;
    },
    tokenCli() {
      const cli = this.$store.getters["fatd/cli"];
      return cli.getTokenCLI(this.chainId);
    },
    token() {
      return this.$store.state.tokens.tracked[this.chainId];
    },
    totalBalance() {
      return this.balances
        .reduce((acc, val) => acc + val.balance, 0)
        .toLocaleString(undefined, {
          maximumFractionDigits: 10
        });
    }
  },
  methods: {
    async fetchBalances() {
      if (!this.token) {
        return;
      }

      const tokenCli = this.tokenCli;
      const addresses = this.$store.getters["address/fctAddressesWithNames"];

      const tokenType = this.token.issuance.type;
      this.balances = await Promise.map(addresses, async function(address) {
        const result = {};
        result.balance = await tokenCli.getBalance(address.address);

        if (tokenType === "FAT-1") {
          console.log(address.address, result.balance);
          if (result.balance > 0) {
            console.log('Checking ', address.address);
            const nfBalance = await tokenCli.getNFBalance(address.address);
            console.log(nfBalance)
            result.ids = nfBalance.map(standardizeId);
          } else {
            result.ids = [];
          }
        }

        return Object.assign(result, address);
      });
    }
  },
  watch: {
    token() {
      this.balances = [];
      this.fetchBalances();
    }
  },
  created() {
    this.fetchBalances();
    const that = this;
    this.intervalId = setInterval(function() {
      that.fetchBalances();
    }, 5000);
  },
  beforeDestroy() {
    clearInterval(this.intervalId);
  }
};
</script>

<style scoped>
</style>
