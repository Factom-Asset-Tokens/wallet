<template>
  <v-layout wrap>
    <v-flex xs12>
      <v-data-table
        class="elevation-1"
        :headers="[
          { text: 'Address', value: 'address' },
          { text: 'Name', value: 'name' },
          { text: 'Balance', value: 'balance', align: 'right' }
        ]"
        :pagination.sync="pagination"
        :items="balances"
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
          <td>
            <div style="display: flex; justify-content: flex-end; align-items: center">
              <div>{{ props.item.balance.toFormat() }}</div>
              <v-icon color="primary" @click="props.expanded = !props.expanded" :disabled="props.item.balance.isZero()"
                >view_list</v-icon
              >
            </div>
          </td>
        </template>
        <template slot="expand" slot-scope="props">
          <v-card v-if="props.expanded" flat>
            <v-card-text>
              <v-chip
                v-for="id in sortIds(props.item.ids)"
                :key="id.min"
                outline
                color="secondary"
                class="font-weight-bold subheading"
                @click="showTokenDetails(id)"
                >{{ id | displayIds }}</v-chip
              >
            </v-card-text>
          </v-card>
        </template>
      </v-data-table>
    </v-flex>
    <NfTokenDetailsDialog ref="detailsDialog" :symbol="symbol" :tokenCli="tokenCli"></NfTokenDetailsDialog>
  </v-layout>
</template>

<script>
import { displayIds, sortIds } from '@/components/Token/Fat1Token/nf-token-ids.js';
import NfTokenDetailsDialog from '@/components/Token/Fat1Token/NfTokenDetailsDialog';

export default {
  components: { NfTokenDetailsDialog },
  props: ['balances', 'symbol', 'tokenCli'],
  data() {
    return {
      pagination: {
        descending: true,
        rowsPerPage: 10,
        sortBy: 'value'
      }
    };
  },
  methods: {
    sortIds,
    showTokenDetails(id) {
      this.$refs.detailsDialog.show(id);
    },
    updateAddressName(address, name) {
      this.$store.commit('address/updateAddressNames', { address, name });
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
