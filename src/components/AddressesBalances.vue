<template>
  <AddressesBalancesFat0 v-if="type === 'FAT-0'" :balances="balances" :symbol="symbol"></AddressesBalancesFat0>
</template>

<script>
import AddressesBalancesFat0 from "@/components/fat0/AddressesBalances";

export default {
  name: "AddressesBalances",
  components: { AddressesBalancesFat0 },
  props: ["type", "balances", "symbol"],
};
</script>

<style scoped>
</style>
