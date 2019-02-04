<template>
  <AddressesBalancesFat0 v-if="type === 'FAT-0'" :balances="balances" :symbol="symbol"></AddressesBalancesFat0>
  <AddressesBalancesFat1
    v-else-if="type === 'FAT-1'"
    :balances="balances"
    :symbol="symbol"
    :tokenCli="tokenCli"
  ></AddressesBalancesFat1>
</template>

<script>
import AddressesBalancesFat0 from "@/components/fat0/AddressesBalances";
import AddressesBalancesFat1 from "@/components/fat1/AddressesBalances";

export default {
  name: "AddressesBalances",
  components: { AddressesBalancesFat0, AddressesBalancesFat1 },
  props: ["type", "balances", "symbol", "tokenCli"]
};
</script>

<style scoped>
</style>
