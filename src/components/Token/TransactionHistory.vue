<template>
  <div>
    <v-list v-if="movements.length > 0">
      <template v-for="(mvt, index) in movements">
        <v-list-tile :key="mvt.txId + mvt.address" @click.stop="openDetails(mvt.txId)">
          <v-layout wrap>
            <v-flex xs2>{{ mvt.timestamp | formatTimestamp }}</v-flex>
            <v-flex xs7 class="font-italic">{{ displayAddress(mvt.address) }}</v-flex>
            <v-flex xs3 class="font-weight-bold" :class="amountColorClass(mvt.sign)" text-xs-right>
              <v-icon v-if="mvt.coinbase" color="secondary" title="Coinbase transaction" left>star</v-icon>
              <v-icon v-if="mvt.burn" color="secondary" title="Burn transaction" left>fas fa-fire-alt</v-icon>
              <v-icon v-if="mvt.hasMetadata" color="secondary" title="Metadata attached" left>more</v-icon>
              {{ mvt.sign }}
              {{ mvt.amount }}
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
    <TransactionDetailsDialog
      :symbol="symbol"
      :addresses="addressesSet"
      ref="transactionDetailsDialog"
    ></TransactionDetailsDialog>
  </div>
</template>

<script>
import { buildTransactionsMovements } from './TransactionHistory/transaction-history-util.js';
import TransactionDetailsDialog from './TransactionHistory/TransactionDetailsDialog';
import moment from 'moment';

const PAGINATION_LIMIT = 10;

export default {
  name: 'TransactionHistory',
  components: { TransactionDetailsDialog },
  data() {
    return {
      movements: [],
      transactions: {},
      nextPage: 1,
      allLoaded: false,
      loading: false
    };
  },
  props: ['tokenCli', 'symbol'],
  computed: {
    addresses() {
      return this.$store.state.address.fctAddresses;
    },
    addressNames() {
      return this.$store.state.address.names;
    },
    addressesSet() {
      return new Set(this.addresses);
    }
  },
  created() {
    this.loadMoreMovements();
  },
  methods: {
    displayAddress(address) {
      return this.addressNames[address] || address;
    },
    amountColorClass(sign) {
      return sign === '+' ? 'green--text' : 'red--text';
    },
    async loadMoreMovements() {
      const initialLoad = this.movements.length === 0;
      try {
        this.loading = true;
        const nbTxsLoaded = await this.fetchPage(this.nextPage);
        this.nextPage++;

        if (nbTxsLoaded < PAGINATION_LIMIT) {
          this.allLoaded = true;
          if (!initialLoad) {
            this.$store.commit('snackInfo', 'No more transaction');
          }
        }
      } catch (e) {
        this.$store.commit('snackError', e.message);
      } finally {
        this.loading = false;
      }

      if (!initialLoad) {
        const vuetify = this.$vuetify;
        this.$nextTick(() => vuetify.goTo('#bottomButton'));
      }
    },
    async fetchPage(page) {
      try {
        const transactions = await this.tokenCli.getTransactions({
          addresses: this.addresses,
          order: 'desc',
          page: page,
          limit: PAGINATION_LIMIT
        });

        transactions.forEach(tx => (this.transactions[tx.getEntryhash()] = tx));

        this.movements = this.movements.concat(buildTransactionsMovements(transactions, this.addresses));

        return transactions.length;
      } catch (e) {
        if (e.message.includes('-32803')) {
          return 0;
        } else {
          throw e;
        }
      }
    },
    openDetails(txId) {
      this.$refs.transactionDetailsDialog.show(this.transactions[txId]);
    }
  },
  filters: {
    formatTimestamp(timestamp) {
      return moment(timestamp * 1000).format('L LT');
    }
  },
  watch: {
    tokenCli() {
      this.movements = [];
      this.transactions = {};
      this.page = 0;
      this.initialFetch();
    }
  }
};
</script>

<style scoped>
.no-transaction-padding {
  padding: 8px;
}
</style>
