<template>
  <v-container>
    <template v-if="token && canManageFatTokens">
      <v-layout wrap mb-5>
        <TokenHeader :token="token" :totalBalance="totalBalance"></TokenHeader>
      </v-layout>

      <AddressesBalances
        :type="token.type"
        :balances="balances"
        :symbol="token.symbol"
        :tokenCli="tokenCli"
      ></AddressesBalances>

      <CreateTransaction
        :type="token.type"
        :balances="balances"
        :symbol="token.symbol"
        :tokenCli="tokenCli"
      ></CreateTransaction>

      <TransactionHistory :tokenCli="tokenCli" :symbol="token.symbol"></TransactionHistory>
    </template>
    <v-layout v-else-if="!canManageFatTokens">
      <v-flex xs12>
        <v-alert
          value="true"
          type="error"
          class="title"
          outline
        >The configuration of fatd, factomd or walletd is incorrect. Go to the settings to fix them.</v-alert>
      </v-flex>
    </v-layout>
    <v-layout v-else row>
      <v-flex xs12>
        <v-alert
          value="true"
          type="error"
          class="title"
          outline
        >This token is not currently tracked.</v-alert>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import TokenHeader from "@/components/Token/TokenHeader";
import AddressesBalances from "@/components/Token/AddressesBalances";
import CreateTransaction from "@/components/Token/CreateTransaction";
import TransactionHistory from "@/components/Token/TransactionHistory";

import Promise from "bluebird";
import { standardizeId } from "@/components/Token/fat1/ids-utils.js";
import AvailableFeatures from "@/mixins/AvailableFeatures";

export default {
  name: "Token",
  components: {
    TokenHeader,
    AddressesBalances,
    CreateTransaction,
    TransactionHistory
  },
  mixins: [AvailableFeatures],
  data() {
    return {
      balances: [],
      intervalId: 0
    };
  },
  computed: {
    addresses() {
      return this.balances.map(v => v.address);
    },
    canManageFatTokens() {
      return this.availableFeatures("fatd", "factomd", "walletd");
    },
    chainId() {
      return this.$route.params.chainid;
    },
    tokenCli() {
      return this.$store.state.tokens.clis[this.chainId];
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
      if (!this.token || !this.canManageFatTokens) {
        return;
      }

      const tokenCli = this.tokenCli;
      const addresses = this.$store.getters["address/fctAddressesWithNames"];

      this.balances = await Promise.map(addresses, async function(address) {
        const result = {};
        result.balance = await tokenCli.getBalance(address.address);

        if (tokenCli.getType() === "FAT-1") {
          if (result.balance > 0) {
            const nfBalance = await tokenCli.getNFBalance({
              address: address.address
            });
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
