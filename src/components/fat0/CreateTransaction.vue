<template>
  <v-flex>
    <h1>Transaction -
      <a @click="toggleMode">{{mode | capitalize}}</a>
    </h1>

    <CreateAdvancedTransaction v-show="mode==='advanced'" :balances="balances" :symbol="symbol"></CreateAdvancedTransaction>
    <CreateSimpleTransaction v-show="mode==='simple'" :balances="balances" :symbol="symbol"></CreateSimpleTransaction>
  </v-flex>
</template>

<script>
import CreateAdvancedTransaction from "@/components/fat0/CreateAdvancedTransaction.vue";
import CreateSimpleTransaction from "@/components/fat0/CreateSimpleTransaction.vue";

export default {
  components: { CreateAdvancedTransaction, CreateSimpleTransaction },
  data() {
    return {
      mode: "simple"
    };
  },
  props: ["balances", "symbol"],
  methods: {
    toggleMode() {
      if (this.mode === "advanced") {
        this.mode = "simple";
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
