<template>
  <CreateTransactionFat0 v-if="type === 0" :balances="balances" :symbol="symbol"></CreateTransactionFat0>
</template>

<script>
import CreateTransactionFat0 from "@/components/fat0/CreateTransaction";

export default {
  name: "CreateTransaction",
  components: { CreateTransactionFat0 },
  props: ["type", "balances", "symbol"]
};
</script>

<style scoped>
</style>
