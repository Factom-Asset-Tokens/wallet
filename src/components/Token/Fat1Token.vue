<template>
  <div>
    <v-container>
      <template v-if="view === 'balances'">
        <v-layout wrap mb-5>
          <TokenHeader :token="token" :totalBalance="totalBalance"></TokenHeader>
        </v-layout>
        <AddressesBalances
          :balances="addressesWithNameAndBalance"
          :symbol="token.symbol"
          :tokenCli="tokenCli"
        ></AddressesBalances>
      </template>

      <CreateTransaction
        v-else-if="view === 'send'"
        :balances="addressesWithNameAndBalance"
        :symbol="token.symbol"
        :tokenCli="tokenCli"
      ></CreateTransaction>
      <TransactionHistory
        v-else-if="view === 'history'"
        :tokenCli="tokenCli"
        :symbol="token.symbol"
      ></TransactionHistory>
    </v-container>
    <NavigationDrawer :tokenId="token.tokenId"></NavigationDrawer>
  </div>
</template>

<script>
import Big from 'bignumber.js';

import TokenHeader from './TokenHeader';
import TransactionHistory from './TransactionHistory';

import AddressesBalances from './Fat1Token/AddressesBalances';
import CreateTransaction from './Fat1Token/CreateTransaction';
import NavigationDrawer from './Fat1Token/NavigationDrawer';

const ZERO = new Big(0);

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
      fetch: true,
      intervalId: 0
    };
  },
  computed: {
    balances() {
      return this.$store.getters['tokens/balancesOf'](this.token.chainId);
    },
    totalBalance() {
      return Object.values(this.balances)
        .reduce((acc, val) => acc.plus(val.balance), ZERO)
        .toFormat();
    },
    view() {
      return this.$route.query.view;
    },
    addressesWithNameAndBalance() {
      const addresses = this.$store.getters['address/fctAddressesWithNames'];
      return addresses.map(a => {
        const b = this.balances[a.address] || { balance: ZERO, ids: [] };
        return {
          address: a.address,
          name: a.name,
          balance: b.balance,
          ids: b.ids
        };
      });
    }
  },
  methods: {
    stopFetchingBalances() {
      clearTimeout(this.intervalId);
      this.intervalId = null;
      this.fetch = false;
    },
    async fetchBalances() {
      await this.$store.dispatch('tokens/fetchBalances', this.token.chainId);
      if (this.fetch) {
        this.intervalId = setTimeout(() => this.fetchBalances(), 5000);
      }
    }
  },
  watch: {
    token() {
      this.fetchBalances();
    }
  },
  created() {
    this.fetchBalances();
  },
  beforeDestroy() {
    this.stopFetchingBalances();
  }
};
</script>
