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
          <td style="display: flex; justify-content: right; align-items: center" class="text-xs-right">
            <div>{{ props.item.balance }}</div>
            <v-icon color="primary" @click="props.expanded = !props.expanded">view_list</v-icon>
          </td>
        </template>
        <template slot="expand" slot-scope="props">
          <v-card v-id="props.expanded" flat color="primary">
            <v-card-text>
              <v-chip
                v-for="id in props.item.ids"
                :key="id"
                color="secondary"
                text-color="white"
              >#{{id}}</v-chip>
            </v-card-text>
          </v-card>
        </template>
      </v-data-table>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  props: ["symbol"],
  data() {
    return {
      balances: [
        { address: "FA1yNbdkjy8ATB3K72TvaeNT9q7aC8pQxCzn3d8Em795XYRzFSpq", name: "my address", balance: 3, ids: [1, 4, 78] },
        { address: "FA29jNtT88wGjs9YLQch8ur4VFaTDkuiDwWe1YmksPDJuh3tAczG", balance: 2, ids: [2, 11] }
      ]
    };
  },
  computed: {
    totalBalance() {
      return this.balances
        .reduce((acc, val) => acc + val.balance, 0)
        .toLocaleString();
    }
  }
};
</script>

<style scoped>
</style>
