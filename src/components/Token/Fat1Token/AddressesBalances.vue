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
          <td>
            <div style="display: flex; justify-content: flex-end; align-items: center">
              <div>{{ props.item.balance.toLocaleString() }}</div>
              <v-icon color="primary" @click="props.expanded = !props.expanded" :disabled="props.item.balance === 0"
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
