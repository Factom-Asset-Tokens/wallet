<template>
  <div>
    <v-flex text-xs-center xs12 my-4>
      <v-sheet class="white--text" color="primary" elevation="1">
        <div class="display-1 font-weight-bold">Transaction history</div>
      </v-sheet>
    </v-flex>
    <v-list>
      <template v-for="(tx, index) in movements">
        <v-list-tile :key="tx.id + tx.address" @click.stop="openDetails(tx.id)">
          <v-layout wrap>
            <v-flex xs2>{{tx.timestamp | formatTimestamp}}</v-flex>
            <v-flex xs6 class="font-italic">{{tx.address}}</v-flex>
            <v-flex xs4 class="font-weight-bold" :class="amountColorClass(tx.sign)" text-xs-right>
              <v-icon v-if="tx.coinbase" color="secondary" title="Coinbase" left>star</v-icon>
              <v-icon v-if="tx.burn" color="secondary" title="Burn" left>fas fa-fire-alt</v-icon>
              {{tx.sign}} {{tx.amount.toLocaleString(undefined, {maximumFractionDigits:8})}}
            </v-flex>
          </v-layout>
        </v-list-tile>
        <v-divider v-if="index + 1 < movements.length" :key="index"></v-divider>
      </template>
    </v-list>
    <v-flex xs12 text-xs-center mt-3>
      <v-btn id="scrollButton" large color="primary" :loading="loading" @click="loadMoreMovements">
        <v-icon left>arrow_drop_down_circle</v-icon>Load more transactions
      </v-btn>
    </v-flex>
    <TransactionDetailsDialog :symbol="symbol" ref="transactionDetailsDialog"></TransactionDetailsDialog>
  </div>
</template>

<script>
import { buildTransactionsMovements } from "./TransactionHistory/transaction-history-util.js";
import TransactionDetailsDialog from "./TransactionHistory/TransactionDetailsDialog";
import moment from "moment";

const PAGINATION_LIMIT = 10;

export default {
  name: "TransactionHistory",
  components: { TransactionDetailsDialog },
  data() {
    return {
      movements: [],
      transactions: {},
      page: 0,
      loading: false
    };
  },
  props: ["tokenCli", "symbol"],
  computed: {
    addresses() {
      return this.$store.state.address.fctAddresses;
    }
  },
  created() {
    this.fetchPage(0);
  },
  methods: {
    amountColorClass(sign) {
      return sign === "+" ? "green--text" : "red--text";
    },
    async loadMoreMovements() {
      try {
        this.loading = true;
        await this.fetchPage(this.page + 1);
        this.page++;
      } catch (e) {
        if (e.message.includes("-32803")) {
          this.$store.commit("snackInfo", "No more transaction");
        } else {
          this.$store.commit("snackError", e.message);
        }
      } finally {
        this.loading = false;
      }

      const vuetify = this.$vuetify;
      this.$nextTick(() => vuetify.goTo("#scrollButton"));
    },
    async fetchPage(page) {
      const transactions = await this.tokenCli.getTransactions({
        addresses: this.addresses,
        order: "desc",
        page: page,
        limit: PAGINATION_LIMIT
      });

      transactions.forEach(tx => (this.transactions[tx.getEntryhash()] = tx));

      this.movements = this.movements.concat(
        buildTransactionsMovements(transactions, this.addresses)
      );
    },
    openDetails(txId) {
      this.$refs.transactionDetailsDialog.show(this.transactions[txId]);
    }
  },
  filters: {
    formatTimestamp(timestamp) {
      return moment(timestamp * 1000).format("L LT");
    }
  },
  watch: {
    tokenCli() {
      this.movements = [];
      this.transactions = {};
      this.page = 0;
      this.fetchPage(0);
    }
  }
};
</script>

<style scoped>
</style>
