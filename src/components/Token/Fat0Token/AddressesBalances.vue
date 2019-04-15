<template>
  <v-layout wrap>
    <v-flex xs12>
      <v-data-table
        class="elevation-1"
        :headers="[
          { text: 'Address', value: 'address', sortable: false },
          { text: 'Name', value: 'name', sortable: false },
          { text: 'Balance', value: 'balance', align: 'right' }
        ]"
        :items="balances"
        item-key="address"
        disable-initial-sort
      >
        <template slot="items" slot-scope="props">
          <td>{{ props.item.address }}</td>
          <td>{{ props.item.name }}</td>
          <td class="text-xs-right">
            {{ props.item.balance.toFormat() }}
          </td>
        </template>
      </v-data-table>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  props: ['balances', 'symbol']
};
</script>

<style scoped></style>
