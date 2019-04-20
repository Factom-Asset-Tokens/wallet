<template>
  <!-- Fungible amounts (FAT-1) -->
  <v-container fluid v-if="areNfTokens">
    <v-layout pa-1 wrap v-for="(io, index) in ios" :key="io.address" align-center :class="rowColor(index)">
      <v-flex xs8>
        <span :title="displayAddressTitle(io.address)">{{ io.address }}</span>
        <v-icon v-if="addresses.has(io.address)" right color="secondary" title="Address in the wallet"
          >account_balance_wallet</v-icon
        >
        <v-icon v-if="specialIcon(io.address)" right color="secondary">{{ specialIcon(io.address) }}</v-icon>
      </v-flex>
      <v-flex xs4 text-xs-right>
        <v-chip
          v-for="id in getNfTokens(io.amount)"
          :key="id.min"
          outline
          color="secondary"
          class="font-weight-bold subheading"
          >{{ id | displayIds }}</v-chip
        >
      </v-flex>
    </v-layout>
  </v-container>
  <!-- Non fungible amount (FAT-0) -->
  <v-container fluid v-else>
    <v-layout wrap py-1 v-for="io in ios" :key="io.address">
      <v-flex xs8>
        <span :title="displayAddressTitle(io.address)">{{ io.address }}</span>
        <v-icon v-if="addresses.has(io.address)" right color="secondary" title="Address in the wallet"
          >account_balance_wallet</v-icon
        >
        <v-icon v-if="specialIcon(io.address)" right color="secondary">{{ specialIcon(io.address) }}</v-icon>
      </v-flex>
      <v-flex xs4 text-xs-right>{{ io.amount.toFormat() }}</v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { displayIds, sortIds, standardizeId } from '@/components/Token/Fat1Token/nf-token-ids.js';

export default {
  props: ['ios', 'type', 'addresses'],
  computed: {
    areNfTokens() {
      return Array.isArray(this.ios[0].amount);
    },
    addressNames() {
      return this.$store.state.address.names;
    }
  },
  methods: {
    displayAddressTitle(address) {
      return this.addressNames[address] || '';
    },
    getNfTokens(amount) {
      return sortIds(amount.map(standardizeId));
    },
    rowColor(index) {
      return index % 2 ? 'lightGrey' : '';
    },
    specialIcon(address) {
      if (address === 'FA1zT4aFpEvcnPqPCigB3fvGu4Q4mTXY22iiuV69DqE1pNhdF2MC') {
        return this.type === 'input' ? 'star' : 'fas fa-fire-alt';
      }
    }
  },
  filters: {
    displayIds
  }
};
</script>
