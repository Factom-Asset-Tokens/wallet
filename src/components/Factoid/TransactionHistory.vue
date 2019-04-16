<template>
  <div>
    <v-flex xs12 text-xs-center class="font-italic" mb-4>
      Please note this page does not show pending transactions, only transactions recorded in a block.
    </v-flex>
    <v-list v-if="movements.length > 0">
      <template v-for="(tx, index) in movements">
        <v-list-tile :key="tx.key" @click.stop="openDetails(tx.id)">
          <v-layout wrap>
            <v-flex xs2>{{ tx.date | formatDate }}</v-flex>
            <v-flex xs6 class="font-italic">{{ tx.address }}</v-flex>
            <v-flex xs4 class="font-weight-bold" :class="amountColorClass(tx.sign)" text-xs-right>
              <v-icon v-if="tx.coinbase" color="secondary" title="Coinbase" left>star</v-icon>
              {{ tx.amount }}
              {{ tx.symbol }}
            </v-flex>
          </v-layout>
        </v-list-tile>
        <v-divider v-if="index + 1 < movements.length" :key="index"></v-divider>
      </template>
    </v-list>
    <v-flex v-else text-xs-center xs12>
      <v-sheet elevation="1">
        <div class="subheading font-italic no-transaction-padding">No past transactions.</div>
      </v-sheet>
    </v-flex>
    <v-flex id="bottomButton" xs12 text-xs-center mt-3>
      <v-btn v-if="!allLoaded" large color="primary" :loading="loading" @click="loadMoreMovements">
        <v-icon left>arrow_drop_down_circle</v-icon>Load more transactions
      </v-btn>
    </v-flex>
    <TransactionDetailsDialog ref="transactionDetailsDialog"></TransactionDetailsDialog>
  </div>
</template>

<script>
import axios from 'axios';
import querystring from 'querystring';
import moment from 'moment';
import { buildTransactionsMovements } from './TransactionHistory/transaction-history-util.js';
import TransactionDetailsDialog from './TransactionHistory/TransactionDetailsDialog';

const tfaApi = axios.create({
  baseURL: 'https://testnet.factoid.org/api/v1/address/transactions/'
});

const PAGINATION_LIMIT = 10;

export default {
  name: 'TransactionHistory',
  components: { TransactionDetailsDialog },
  data() {
    return {
      movements: [],
      transactions: {},
      nextPage: 0,
      loading: false,
      allLoaded: false
    };
  },
  computed: {
    addresses() {
      return this.$store.state.address.fctAddresses.concat(this.$store.state.address.ecAddresses);
    }
  },
  created() {
    this.loadMoreMovements();
  },
  methods: {
    amountColorClass(sign) {
      return sign === '+' ? 'green--text' : 'red--text';
    },
    async loadMoreMovements() {
      try {
        this.loading = true;
        const nbTxsLoaded = await this.fetchPage(this.nextPage);
        this.nextPage++;

        if (nbTxsLoaded < PAGINATION_LIMIT) {
          this.allLoaded = true;
        }
      } catch (e) {
        this.$store.commit('snackError', e.message);
      } finally {
        this.loading = false;
      }

      const vuetify = this.$vuetify;
      this.$nextTick(() => vuetify.goTo('#bottomButton'));
    },
    async fetchPage(page) {
      const url = `${this.addresses.join(',')}?${querystring.stringify({
        limit: PAGINATION_LIMIT,
        offset: page * PAGINATION_LIMIT
      })}`;

      const { data } = await tfaApi.get(url);

      if (data.error) {
        throw new Error(data.error);
      }
      if (!data.result.transactions) {
        return 0;
      }
      const transactions = data.result.transactions;

      transactions.forEach(tx => (this.transactions[tx.txid] = tx));
      const newMovements = buildTransactionsMovements(transactions, this.addresses);
      this.movements = this.movements.concat(newMovements);

      return transactions.length;
    },
    openDetails(txId) {
      this.$refs.transactionDetailsDialog.show(this.transactions[txId]);
    }
  },
  filters: {
    formatDate(date) {
      return moment(date).format('L LT');
    }
  }
};
</script>

<style scoped>
.no-transaction-padding {
  padding: 8px;
}
</style>
