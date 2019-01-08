<template>
  <v-layout wrap>
    <v-flex text-xs-center xs12 my-4 py-2>
      <v-sheet class="white--text" color="primary" elevation="1">
        <h1>Total balance: {{totalBalance}} {{symbol}}</h1>
      </v-sheet>
    </v-flex>

    <v-flex xs12>
      <!-- TODO use Slot: progress-->
      <v-data-table
        class="elevation-1"
        :headers="[{text: 'Address', value: 'address', sortable: false},
      {text: 'Name', value: 'name', sortable: false},
       {text: 'Balance', value: 'balance', align: 'right'}]"
        :items="balances"
        disable-initial-sort
      >
        <template slot="items" slot-scope="props">
          <td>{{ props.item.address }}</td>
          <td>{{ props.item.name }}</td>
          <td class="text-xs-right">{{ props.item.balance }}</td>
        </template>
      </v-data-table>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  props: ["balances", "symbol"],
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
