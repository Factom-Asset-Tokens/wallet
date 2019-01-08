<template>
  <v-layout wrap>
    <v-flex text-xs-center xs12 my-4>
      <v-sheet class="white--text" color="primary" elevation="1">
        <h1>
          Send transaction -
          <a
            @click="toggleMode"
            class="secondary--text"
          >{{mode | capitalize}} mode</a>
        </h1>
      </v-sheet>
    </v-flex>
    <v-flex xs12>
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
  </v-layout>
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
</style>
