<template>
  <div>
    <v-container>
      <template v-if="showComponent === 'balances'">
        <v-layout wrap mb-5>
          <TokenHeader :token="token" :totalBalance="totalBalance"></TokenHeader>
        </v-layout>
        <AddressesBalances :balances="balances" :symbol="token.symbol" :tokenCli="tokenCli"></AddressesBalances>
      </template>

      <CreateTransaction
        v-else-if="showComponent === 'send'"
        :balances="balances"
        :symbol="token.symbol"
        :tokenCli="tokenCli"
      ></CreateTransaction>
      <TransactionHistory
        v-else-if="showComponent === 'history'"
        :tokenCli="tokenCli"
        :symbol="token.symbol"
      ></TransactionHistory>
    </v-container>
    <NavigationDrawer @show="showComponent = $event" :tokenId="token.tokenId"></NavigationDrawer>
  </div>
</template>

<script>
import TokenHeader from './TokenHeader';
import TransactionHistory from './TransactionHistory';

import AddressesBalances from './Fat1Token/AddressesBalances';
import CreateTransaction from './Fat1Token/CreateTransaction';
import NavigationDrawer from './Fat1Token/NavigationDrawer';

import Promise from 'bluebird';
import { standardizeId } from './Fat1Token/nf-token-ids.js';

export default {
  name: 'Fat1Token',
  components: {
    TokenHeader,
    AddressesBalances,
    CreateTransaction,
    TransactionHistory,
    NavigationDrawer
  },
  props: ['token', 'tokenCli'],
  data() {
    return {
      balances: [],
      intervalId: 0,
      showComponent: 'balances'
    };
  },
  computed: {
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
      const tokenCli = this.tokenCli;
      const addresses = this.$store.getters['address/fctAddressesWithNames'];

      this.balances = await Promise.map(addresses, async function(address) {
        const result = {};
        result.balance = await tokenCli.getBalance(address.address);

        if (result.balance > 0) {
          const nfBalance = await tokenCli.getNFBalance({
            address: address.address
          });
          result.ids = nfBalance.map(standardizeId);
        } else {
          result.ids = [];
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
