<template>
  <v-flex xs12 md8 offset-md2>
    <v-card color="primary">
      <v-card-text>
        <v-layout align-center justify-center wrap>
          <v-flex class="display-1 white--text font-weight-black" xs12 text-xs-center mb-3>{{name}}</v-flex>
          <v-flex xs12 text-xs-center>
            <div class="total-balance">
              <img class="balance-icon" src="/img/coin-yellow.png">
              <div class="secondary--text display-1 font-weight-bold">{{totalBalance}} {{symbol}}</div>
            </div>
          </v-flex>
        </v-layout>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn icon @click="showDetails = !showDetails">
          <v-icon>{{ showDetails ? 'keyboard_arrow_down' : 'keyboard_arrow_up' }}</v-icon>
        </v-btn>
      </v-card-actions>

      <v-sheet v-show="showDetails">
        <v-container>
          <v-layout wrap>
            <v-flex xs2 my-2>Chain ID:</v-flex>
            <v-flex xs10 my-2>{{token.chainId}}</v-flex>
            <v-flex xs2 my-2>Issuer:</v-flex>
            <v-flex xs10 my-2>{{token.issuer}}</v-flex>

            <TokenSupplyDetails :chainId="token.chainId" :symbol="token.issuance.symbol"></TokenSupplyDetails>
            <v-flex xs12 text-xs-right>
              <v-btn color="primary" @click="untrack">stop tracking</v-btn>
            </v-flex>
          </v-layout>
        </v-container>
      </v-sheet>
    </v-card>
  </v-flex>
</template>

<script>
import TokenSupplyDetails from "@/components/TokenSupplyDetails";

export default {
  name: "TokenHeader",
  components: { TokenSupplyDetails },
  data() {
    return {
      showDetails: false
    };
  },
  props: ["token", "totalBalance"],
  computed: {
    name() {
      return this.token.issuance.name
        ? this.token.issuance.name
        : this.token.tokenId;
    },
    symbol() {
      return this.token.issuance.symbol || "";
    },
    description() {
      return this.token.issuance.description;
    }
  },
  methods: {
    untrack() {
      this.$store.commit("tokens/untrack", this.token.chainId);
      this.$router.push({ name: "Actions" });
    }
  }
};
</script>

<style scoped>
.balance-icon {
  margin-right: 16px;
}
.total-balance {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px;
}
</style>
