<template>
  <div>
    <v-container>
      <template v-if="showComponent === 'balances'">
        <v-layout wrap mb-5>
          <TokenHeader :token="token" :totalBalance="totalBalance"></TokenHeader>
        </v-layout>
        <AddressesBalances :balances="balances" :symbol="token.symbol" :tokenCli="tokenCli"></AddressesBalances>
      </template>
      <CreateBasicTransaction
        v-else-if="showComponent === 'send'"
        :balances="balances"
        :symbol="token.symbol"
        :tokenCli="tokenCli"
      ></CreateBasicTransaction>
      <CreateAdvancedTransaction
        v-else-if="showComponent === 'send-advanced'"
        :balances="balances"
        :symbol="token.symbol"
        :tokenCli="tokenCli"
      ></CreateAdvancedTransaction>
      <TransactionHistory
        v-else-if="showComponent === 'history'"
        :tokenCli="tokenCli"
        :symbol="token.symbol"
      ></TransactionHistory>
    </v-container>
    <SideBar @show="showComponent = $event" :tokenId="token.tokenId"></SideBar>
  </div>
</template>

<script>
import TokenHeader from './TokenHeader';
import TransactionHistory from './TransactionHistory';

import AddressesBalances from './Fat0Token/AddressesBalances';
import CreateBasicTransaction from './Fat0Token/CreateBasicTransaction';
import CreateAdvancedTransaction from './Fat0Token/CreateAdvancedTransaction';
import SideBar from './Fat0Token/SideBar';

import Promise from 'bluebird';

export default {
  name: 'Fat0Token',
  components: {
    TokenHeader,
    AddressesBalances,
    CreateBasicTransaction,
    CreateAdvancedTransaction,
    TransactionHistory,
    SideBar
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
