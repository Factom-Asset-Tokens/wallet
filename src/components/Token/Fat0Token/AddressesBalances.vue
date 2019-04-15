<template>
  <v-layout wrap>
    <v-flex xs12>
      <v-data-table
        class="elevation-1"
        :headers="[
          { text: 'Address', value: 'address', sortable: false },
          { text: 'Name', value: 'name', sortable: false },
          { text: 'Balance', value: 'value', align: 'right' }
        ]"
        :items="items"
        item-key="address"
        disable-initial-sort
      >
        <template slot="items" slot-scope="props">
          <td>{{ props.item.address }}</td>
          <td>{{ props.item.name }}</td>
          <td class="text-xs-right">
            {{ props.item.balanceText }}
          </td>
        </template>
      </v-data-table>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  props: ['balances', 'symbol'],
  computed: {
    items() {
      return this.balances.map(b => ({
        address: b.address,
        value: b.balance.toNumber(),
        balanceText: b.balance.toFormat(),
        name: b.name
      }));
    }
  }
};
</script>

<style scoped></style>
