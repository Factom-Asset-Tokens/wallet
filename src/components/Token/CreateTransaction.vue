<template>
  <CreateTransactionFat0
    v-if="type === 'FAT-0'"
    :balances="balances"
    :symbol="symbol"
    :tokenCli="tokenCli"
  ></CreateTransactionFat0>
  <CreateTransactionFat1
    v-else-if="type === 'FAT-1'"
    :balances="balances"
    :symbol="symbol"
    :tokenCli="tokenCli"
  ></CreateTransactionFat1>
</template>

<script>
import CreateTransactionFat0 from "./CreateTransaction/fat0/CreateTransaction";
import CreateTransactionFat1 from "./CreateTransaction/fat1/CreateTransaction";

export default {
  name: "CreateTransaction",
  components: { CreateTransactionFat0, CreateTransactionFat1 },
  props: ["type", "balances", "symbol", "tokenCli"]
};
</script>

<style scoped>
</style>
