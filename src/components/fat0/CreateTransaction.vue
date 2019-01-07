<template>
  <v-flex>
    <h1>
      Transaction -
      <a @click="toggleMode">{{mode | capitalize}}</a>
    </h1>

    <CreateAdvancedTransaction
      v-show="mode==='advanced'"
      :balances="balances"
      :symbol="symbol"
      :tokenCli="tokenCli"
    ></CreateAdvancedTransaction>
    <CreateBasicTransaction
      v-show="mode==='basic'"
      :balances="balances"
      :symbol="symbol"
      :tokenCli="tokenCli"
    ></CreateBasicTransaction>
  </v-flex>
</template>

<script>
import CreateAdvancedTransaction from "@/components/fat0/CreateAdvancedTransaction.vue";
import CreateBasicTransaction from "@/components/fat0/CreateBasicTransaction.vue";

export default {
  components: { CreateAdvancedTransaction, CreateBasicTransaction },
  data() {
    return {
      mode: "basic"
    };
  },
  props: ["balances", "symbol", "tokenCli"],
  methods: {
    toggleMode() {
      if (this.mode === "advanced") {
        this.mode = "basic";
      } else {
        this.mode = "advanced";
      }
    }
  },
  filters: {
    capitalize: function(value) {
      if (!value) return "";
      value = value.toString();
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
  }
};
</script>

<style scoped>
h1 {
  margin-bottom: 36px;
}
</style>
