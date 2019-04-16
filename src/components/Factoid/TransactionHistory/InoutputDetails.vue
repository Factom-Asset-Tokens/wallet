<template>
  <v-container fluid>
    <v-layout wrap py-1 v-for="io in ios" :key="io.key">
      <v-flex xs8>
        {{ io.address }}
        <v-icon v-if="addresses.has(io.address)" right title="Address in the wallet">account_balance_wallet</v-icon>
      </v-flex>
      <v-flex xs4 text-xs-right>{{ io.amount }} {{ symbol }}</v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  props: ['ios', 'symbol'],
  computed: {
    addresses() {
      return new Set(this.$store.state.address.fctAddresses.concat(this.$store.state.address.ecAddresses));
    }
  }
};
</script>
