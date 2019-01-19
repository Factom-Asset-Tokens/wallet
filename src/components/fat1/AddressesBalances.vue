<template>
  <v-layout wrap>
    <v-flex text-xs-center xs12 my-4 py-2>
      <v-sheet class="white--text" color="primary" elevation="1">
        <h1>{{totalBalance}} {{symbol}}</h1>
      </v-sheet>
    </v-flex>

    <v-flex xs12>
      <v-data-table
        class="elevation-1"
        :headers="[{text: 'Address', value: 'address', sortable: false},
      {text: 'Name', value: 'name', sortable: false},
       {text: 'Balance', value: 'balance', align: 'right'}]"
        :items="balances"
        item-key="address"
        disable-initial-sort
      >
        <template slot="items" slot-scope="props">
          <td>{{ props.item.address }}</td>
          <td>{{ props.item.name }}</td>
          <td
            style="display: flex; justify-content: right; align-items: center"
            class="text-xs-right"
          >
            <div>{{ props.item.balance }}</div>
            <v-icon color="primary" @click="props.expanded = !props.expanded">view_list</v-icon>
          </td>
        </template>
        <template slot="expand" slot-scope="props">
          <v-card v-if="props.expanded" flat>
            <v-card-text>
              <v-chip
                v-for="id in sortIds(props.item.ids)"
                :key="id.from || id"
                outline
                color="secondary"
                class="font-weight-bold subheading"
                @click="showTokenDetails(id)"
              >{{id | displayIds}}</v-chip>
            </v-card-text>
          </v-card>
        </template>
      </v-data-table>
    </v-flex>
    <TokenDetailsDialog ref="detailsDialog" :symbol="symbol"></TokenDetailsDialog>
  </v-layout>
</template>

<script>
import { displayIds, sortIds } from "./ids-utils.js";
import TokenDetailsDialog from "./TokenDetailsDialog";
import balances from "./mockup-balances.json";

export default {
  components: { TokenDetailsDialog },
  props: ["symbol"],
  data() {
    return {
      balances
    };
  },
  computed: {
    totalBalance() {
      return this.balances
        .reduce((acc, val) => acc + val.balance, 0)
        .toLocaleString();
    }
  },
  methods: {
    sortIds,
    showTokenDetails(id) {
      this.$refs.detailsDialog.show(id);
    }
  },
  filters: {
    displayIds
  }
};
</script>

<style scoped>
.grey-text {
  color: #424242;
}
</style>
