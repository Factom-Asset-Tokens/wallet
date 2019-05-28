<template>
  <v-layout wrap>
    <v-flex xs2 my-2 class="secondary--text font-weight-bold">Maximum supply</v-flex>
    <v-flex xs10 my-2 pl-3>{{ maxSupplyText }}</v-flex>
    <v-flex xs2 my-2 class="secondary--text font-weight-bold">Circulating supply</v-flex>
    <v-flex xs10 my-2 pl-3>{{ circulatingSupplyText }}</v-flex>
    <v-flex xs2 my-2 class="secondary--text font-weight-bold">Burned</v-flex>
    <v-flex xs10 my-2 pl-3>{{ burnedText }}</v-flex>
    <v-flex xs2 my-2 class="secondary--text font-weight-bold">Remaining supply</v-flex>
    <v-flex xs10 my-2 pl-3>{{ remainingSupplyText }}</v-flex>
  </v-layout>
</template>

<script>
import Big from 'bignumber.js';

const INFINITE_SUPPLY = new Big(-1);

export default {
  props: ['chainId', 'symbol'],
  data() {
    return {
      maxSupply: new Big(0),
      burnedSupply: new Big(0),
      circulatingSupply: new Big(0)
    };
  },
  computed: {
    maxSupplyText() {
      return this.maxSupply.isEqualTo(INFINITE_SUPPLY) ? 'Infinite' : `${this.maxSupply.toFormat()} ${this.symbol}`;
    },
    burnedText() {
      return `${this.burnedSupply.toFormat()} ${this.symbol}`;
    },
    circulatingSupplyText() {
      return `${this.circulatingSupply.toFormat()} ${this.symbol}`;
    },
    remainingSupply() {
      return this.maxSupply.isEqualTo(INFINITE_SUPPLY)
        ? INFINITE_SUPPLY
        : this.maxSupply.minus(this.circulatingSupply).minus(this.burnedSupply);
    },
    remainingSupplyText() {
      return this.remainingSupply.isEqualTo(INFINITE_SUPPLY)
        ? 'Infinite'
        : `${this.remainingSupply.toFormat()} ${this.symbol}`;
    }
  },
  methods: {
    async fetchStats() {
      const tokenCli = this.$store.state.tokens.clis[this.chainId];
      const stats = await tokenCli.getStats();

      this.maxSupply = new Big(stats.Issuance.supply);
      this.burnedSupply = stats.burned;
      this.circulatingSupply = stats.circulating;
    }
  },
  watch: {
    chainId() {
      this.fetchStats();
    }
  },
  mounted() {
    this.fetchStats();
  }
};
</script>
