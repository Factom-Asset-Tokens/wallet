<template>
  <div>
    <v-container>
      <template v-if="view === 'balances'">
        <v-layout wrap mb-5>
          <TokenHeader :token="token" :totalBalance="totalBalance.toFormat()"></TokenHeader>
        </v-layout>
        <AddressesBalances
          :balances="addressesWithNameAndBalance"
          :symbol="token.symbol"
          :tokenCli="tokenCli"
        ></AddressesBalances>
      </template>
      <CreateBasicTransaction
        v-else-if="view === 'send'"
        :balances="addressesWithNameAndBalance"
        :totalBalance="totalBalance"
        :symbol="token.symbol"
        :tokenCli="tokenCli"
      ></CreateBasicTransaction>
      <CreateAdvancedTransaction
        v-else-if="view === 'send-advanced'"
        :balances="addressesWithNameAndBalance"
        :symbol="token.symbol"
        :tokenCli="tokenCli"
      ></CreateAdvancedTransaction>
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

import AddressesBalances from './Fat0Token/AddressesBalances';
import CreateBasicTransaction from './Fat0Token/CreateBasicTransaction';
import CreateAdvancedTransaction from './Fat0Token/CreateAdvancedTransaction';
import NavigationDrawer from './Fat0Token/NavigationDrawer';

const ZERO = new Big(0);

export default {
  name: 'Fat0Token',
  components: {
    TokenHeader,
    AddressesBalances,
    CreateBasicTransaction,
    CreateAdvancedTransaction,
    TransactionHistory,
    NavigationDrawer
  },
  props: ['token', 'tokenCli'],
  data() {
    return {
      intervalId: 0
    };
  },
  computed: {
    balances() {
      return this.$store.getters['tokens/balancesOf'](this.token.chainId);
    },
    totalBalance() {
      return Object.values(this.balances).reduce((acc, val) => acc.plus(val), ZERO);
    },
    view() {
      return this.$route.query.view;
    },
    addressesWithNameAndBalance() {
      const addresses = this.$store.getters['address/fctAddressesWithNames'];
      return addresses.map(a => ({ address: a.address, name: a.name, balance: this.balances[a.address] || ZERO }));
    }
  },
  methods: {
    async fetchBalances() {
      try {
        await this.$store.dispatch('tokens/fetchBalances', this.token.chainId);
      } catch (e) {
        this.$store.commit('snackError', `Error fetching balances: ${e.message}`);
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
