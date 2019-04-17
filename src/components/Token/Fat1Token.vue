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
import Promise from 'bluebird';
import Big from 'bignumber.js';

import TokenHeader from './TokenHeader';
import TransactionHistory from './TransactionHistory';

import AddressesBalances from './Fat1Token/AddressesBalances';
import CreateTransaction from './Fat1Token/CreateTransaction';
import NavigationDrawer from './Fat1Token/NavigationDrawer';

import { standardizeId } from './Fat1Token/nf-token-ids.js';

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
      balances: {},
      intervalId: 0
    };
  },
  computed: {
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
        const b = this.balances[a.address] || { balance: 0, ids: [] };
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
    async fetchBalances() {
      const tokenCli = this.tokenCli;
      const addresses = this.$store.state.address.fctAddresses;

      this.balances = await Promise.reduce(
        addresses,
        async function(acc, address) {
          const result = {};
          result.balance = await tokenCli.getBalance(address);

          if (result.balance > 0) {
            const nfBalance = await tokenCli.getNFBalance({
              address,
              limit: result.balance
            });

            result.ids = nfBalance.map(standardizeId);
          } else {
            result.ids = [];
          }

          acc[address] = result;
          return acc;
        },
        {}
      );
    }
  },
  watch: {
    token() {
      this.balances = {};
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
