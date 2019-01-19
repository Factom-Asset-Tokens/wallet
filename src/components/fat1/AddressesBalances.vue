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
              >{{id | displayIds}}</v-chip>
            </v-card-text>
          </v-card>
        </template>
      </v-data-table>
    </v-flex>
  </v-layout>
</template>

<script>
import { displayIds, sortIds } from "./ids-utils.js";

export default {
  props: ["symbol"],
  data() {
    return {
      balances: [
        {
          address: "FA1yNbdkjy8ATB3K72TvaeNT9q7aC8pQxCzn3d8Em795XYRzFSpq",
          name: "my address",
          balance: 3,
          ids: [
            { from: 1, to: 1 },
            { from: 5, to: 9 },
            { from: 10, to: 10 },
            { from: 78, to: 78 }
          ]
        },
        {
          address: "FA29jNtT88wGjs9YLQch8ur4VFaTDkuiDwWe1YmksPDJuh3tAczG",
          balance: 2,
          ids: [
            { from: 11, to: 11 },
            { from: 23, to: 55 },
            { from: 2, to: 2 },
            { from: 12, to: 20 }
          ]
        }
      ]
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
    sortIds
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
