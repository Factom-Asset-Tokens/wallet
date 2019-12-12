<template>
  <v-layout wrap>
    <v-flex xs12>
      <v-data-table
        class="elevation-1"
        :headers="[
          { text: 'Address', value: 'address' },
          { text: 'Name', value: 'name' },
          { text: 'Balance', value: 'value', align: 'right' }
        ]"
        :pagination.sync="pagination"
        :items="items"
        item-key="address"
        disable-initial-sort
      >
        <template slot="items" slot-scope="props">
          <td>{{ props.item.address }}</td>
          <td>
            <v-edit-dialog :return-value.sync="props.item.name" lazy>
              <span v-if="props.item.name" class="break-word">{{ props.item.name }}</span>
              <v-icon v-else color="lighterGrey">edit</v-icon>
              <v-text-field
                maxlength="120"
                counter="120"
                slot="input"
                :value="props.item.name"
                @input="updateAddressName(props.item.address, $event)"
                label="Edit"
                single-line
              ></v-text-field>
            </v-edit-dialog>
          </td>
          <td class="text-xs-right">{{ props.item.balanceText }}</td>
        </template>
      </v-data-table>
    </v-flex>
  </v-layout>
</template>

<script>
import debounce from 'lodash.debounce';

export default {
  props: ['balances', 'symbol'],
  data() {
    return {
      pagination: {
        descending: true,
        rowsPerPage: 10,
        sortBy: 'value'
      }
    };
  },
  created() {
    this.debouncedUpdateAddressNames = debounce(this.$store.commit.bind(this, 'address/updateAddressNames'), 500);
  },
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
      this.debouncedUpdateAddressNames({ address, name });
    }
  }
};
</script>

<style scoped></style>
