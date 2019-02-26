<template>
  <v-layout wrap>
    <v-flex xs2 my-2>Maximum supply:</v-flex>
    <v-flex xs10 my-2>{{maxSupplyText}}</v-flex>
    <v-flex xs2 my-2>Circulating supply:</v-flex>
    <v-flex xs10 my-2>{{circulatingSupplyText}}</v-flex>
    <v-flex xs2 my-2>Burned:</v-flex>
    <v-flex xs10 my-2>{{burnedText}}</v-flex>
    <v-flex xs2 my-2>Remaining supply:</v-flex>
    <v-flex xs10 my-2>{{remainingSupplyText}}</v-flex>
  </v-layout>
</template>

<script>
export default {
  props: ["chainId", "symbol"],
  data() {
    return {
      stats: {
        supply: 0,
        burned: 0,
        circulating: 0
      }
    };
  },
  computed: {
    maxSupply() {
      return this.stats.supply;
    },
    maxSupplyText() {
      return this.maxSupply === -1
        ? "Infinite"
        : `${this.maxSupply.toLocaleString()} ${this.symbol}`;
    },
    burned() {
      return this.stats.burned;
    },
    circulatingSupply() {
      return this.stats.circulating;
    },
    burnedText() {
      return `${this.burned.toLocaleString()} ${this.symbol}`;
    },
    circulatingSupplyText() {
      return `${this.circulatingSupply.toLocaleString()} ${this.symbol}`;
    },
    remainingSupply() {
      return this.maxSupply === -1
        ? -1
        : this.maxSupply - this.circulatingSupply - this.burned;
    },
    remainingSupplyText() {
      return this.remainingSupply === -1
        ? "Infinite"
        : `${this.remainingSupply.toLocaleString()} ${this.symbol}`;
    }
  },
  methods: {
    async fetchStats() {
      const tokenCli = this.$store.state.tokens.clis[this.chainId];
      this.stats = await tokenCli.getStats();
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