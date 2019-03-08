<template>
  <Fat0AddressesBalances v-if="type === 'FAT-0'" :balances="balances" :symbol="symbol"></Fat0AddressesBalances>
  <Fat1AddressesBalances
    v-else-if="type === 'FAT-1'"
    :balances="balances"
    :symbol="symbol"
    :tokenCli="tokenCli"
  ></Fat1AddressesBalances>
</template>

<script>
import Fat0AddressesBalances from "./AddressesBalances/Fat0AddressesBalances";
import Fat1AddressesBalances from "./AddressesBalances/Fat1AddressesBalances";

export default {
  name: "AddressesBalances",
  components: { Fat0AddressesBalances, Fat1AddressesBalances },
  props: ["type", "balances", "symbol", "tokenCli"]
};
</script>

<style scoped>
</style>
