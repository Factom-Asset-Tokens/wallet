<template>
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
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "AddressesBalances",
  data() {
    return {
      balances: []
    };
  },
  props: ["token"],
  computed: {
    ...mapState({
      fctAddresses: state => state.walletd.fctAddresses
    })
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
    token() {
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
