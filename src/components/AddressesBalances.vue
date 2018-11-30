<template>
  <AddressesBalancesFat0 v-if="type === 0" :balances="balances"></AddressesBalancesFat0>
</template>

<script>
import AddressesBalancesFat0 from "@/components/fat0/AddressesBalances";

export default {
  name: "AddressesBalances",
  components: { AddressesBalancesFat0 },
  props: ["type", "balances"],
};
</script>

<style scoped>
</style>
