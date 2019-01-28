<template>
  <v-layout wrap>
    <v-flex text-xs-center xs12 my-4>
      <v-sheet class="white--text" color="primary" elevation="1">
        <div class="display-1 font-weight-bold">Send transaction
          <v-btn flat icon color="secondary" @click="toggleMode">
            <v-icon>fas fa-cogs</v-icon>
          </v-btn>
        </div>
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
  }
};
</script>

<style scoped>
</style>
