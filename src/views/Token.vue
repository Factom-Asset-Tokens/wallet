<style scoped>
</style>
<template>
  <v-container grid-list-xl>
    <v-layout row>
      <v-flex xs12 sm8 offset-sm2>
        <v-card>
          <v-card-text>
            <v-layout align-center justify-center row fill-height>
              <v-avatar :size="64" color="grey lighten-4">
                <img :src="icon" alt="Token icon">
              </v-avatar>

              <h1>
                {{name}}
                <template v-if="symbol">({{symbol}})</template>
              </h1>
            </v-layout>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn icon @click="showDetails = !showDetails">
              <v-icon>{{ showDetails ? 'keyboard_arrow_down' : 'keyboard_arrow_up' }}</v-icon>
            </v-btn>
          </v-card-actions>

          <v-slide-y-transition>
            <v-card-text v-show="showDetails">{{description}}</v-card-text>
          </v-slide-y-transition>
        </v-card>
      </v-flex>
    </v-layout>

    <!-- TODO use Slot: progress-->
    <v-data-table
      :headers="[{text: 'Address', value: 'address', sortable: false}, {text: 'Balance', value: 'balance', align: 'right'}]"
      :items="balances"
      disable-initial-sort
    >
      <template slot="items" slot-scope="props">
        <td>{{ props.item.address }}</td>
        <td class="text-xs-right">{{ props.item.balance }}</td>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "Token",
  data() {
    return {
      showDetails: false,
      balances: []
    };
  },
  computed: {
    chainId() {
      return this.$route.params.chainid;
    },
    token() {
      return this.$store.state.tokens.tracked[this.chainId];
    },
    icon() {
      return this.token.metadata && this.token.metadata.iconSrc
        ? this.token.metadata.iconSrc
        : "https://png.icons8.com/dotty/40/000000/help.png";
    },
    name() {
      return this.token.issuance && this.token.issuance.name
        ? this.token.issuance.name
        : this.token.tokenId;
    },
    symbol() {
      return this.token.issuance && this.token.issuance.symbol
        ? this.token.issuance.symbol
        : "";
    },
    description() {
      return this.token.issuance && this.token.issuance.description
        ? this.token.issuance.description
        : "No description available";
    },
    ...mapState({
      fctAddresses: state => state.walletd.fctAddresses
    }),
    daemonsOk() {
      return this.$store.getters.daemonsOk;
    }
  },
  methods: {
    fetchBalances() {
      //const cli = this.$store.getters["fatd/cli"];
      this.balances = this.fctAddresses.map(address => ({
        address,
        balance: (Math.random() * 100).toFixed(10)
      }));
    }
  },
  watch: {
    chainId() {
      this.fetchBalances();
    }
  },
  mounted() {
    this.fetchBalances();
  }
};
</script>

<style scoped>
</style>
