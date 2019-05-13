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
export default {
  props: ['chainId', 'symbol'],
  data() {
    return {
      maxSupply: 0,
      burnedSupply: 0,
      circulatingSupply: 0
    };
  },
  computed: {
    maxSupplyText() {
      return this.maxSupply === -1 ? 'Infinite' : `${this.maxSupply.toLocaleString()} ${this.symbol}`;
    },
    burnedText() {
      return `${this.burnedSupply.toLocaleString()} ${this.symbol}`;
    },
    circulatingSupplyText() {
      return `${this.circulatingSupply.toLocaleString()} ${this.symbol}`;
    },
    remainingSupply() {
      return this.maxSupply === -1 ? -1 : this.maxSupply - this.circulatingSupply - this.burnedSupply;
    },
    remainingSupplyText() {
      return this.remainingSupply === -1 ? 'Infinite' : `${this.remainingSupply.toLocaleString()} ${this.symbol}`;
    }
  },
  methods: {
    async fetchStats() {
      const tokenCli = this.$store.state.tokens.clis[this.chainId];
      const stats = await tokenCli.getStats();
      this.maxSupply = stats.Issuance.supply;
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
