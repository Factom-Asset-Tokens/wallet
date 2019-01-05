<template>
  <v-flex>
    <h1>Balances</h1>
    <h2>Total: {{totalBalance}} {{symbol}}</h2>
    <!-- TODO use Slot: progress-->
    <v-data-table
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
</template>

<script>
export default {
  props: ["balances", "symbol"],
  computed: {
    totalBalance() {
      return this.balances.reduce((acc, val) => acc + val.balance, 0).toLocaleString();
    }
  }
};
</script>

<style scoped>
h1 {
  margin-bottom: 12px;
}
h2 {
  margin-bottom: 36px;
  text-align: center;
}
</style>
