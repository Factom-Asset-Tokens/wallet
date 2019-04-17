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
          <td>
            <v-edit-dialog :return-value.sync="props.item.name" lazy>
              {{ props.item.name }}
              <v-text-field
                slot="input"
                :value="props.item.name"
                @input="updateAddressName(props.item.address, $event)"
                label="Edit"
                single-line
              ></v-text-field>
            </v-edit-dialog>
          </td>
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
  },
  methods: {
    updateAddressName(address, name) {
      this.$store.commit('address/updateAddressNames', { address, name });
    }
  }
};
</script>

<style scoped></style>
