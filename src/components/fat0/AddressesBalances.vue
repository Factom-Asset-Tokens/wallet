<template>
  <v-flex>
    <h1>Balances</h1>
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
  </v-flex>
</template>

<script>
export default {
  props: ["balances"]
};
</script>

<style scoped>
</style>
