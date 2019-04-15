<template>
  <div>
    <v-container>
      <template v-if="view === 'balances'">
        <v-layout wrap mb-5>
          <TokenHeader :token="token" :totalBalance="totalBalance.toFormat()"></TokenHeader>
        </v-layout>
        <AddressesBalances :balances="balances" :symbol="token.symbol" :tokenCli="tokenCli"></AddressesBalances>
      </template>
      <CreateBasicTransaction
        v-else-if="view === 'send'"
        :balances="balances"
        :totalBalance="totalBalance"
        :symbol="token.symbol"
        :tokenCli="tokenCli"
      ></CreateBasicTransaction>
      <CreateAdvancedTransaction
        v-else-if="view === 'send-advanced'"
        :balances="balances"
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

import Promise from 'bluebird';

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
      balances: [],
      intervalId: 0
    };
  },
  computed: {
    totalBalance() {
      return this.balances.reduce((acc, val) => acc.plus(val.balance), new Big(0));
    },
    view() {
      return this.$route.query.view;
    }
  },
  methods: {
    async fetchBalances() {
      const tokenCli = this.tokenCli;
      const addresses = this.$store.getters['address/fctAddressesWithNames'];

      this.balances = await Promise.map(addresses, async function(address) {
        const balance = await tokenCli.getBalance(address.address);
        return Object.assign({ balance: new Big(balance) }, address);
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
