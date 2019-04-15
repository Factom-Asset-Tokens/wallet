<template>
  <v-layout wrap>
    <v-flex xs12 mb-5>
      <v-layout align-center wrap>
        <v-flex xs12 md6>
          <v-sheet color="secondary" class="white--text display-1 font-weight-medium">
            <div class="total-balance" :title="`${totalFctBalanceText.exact} FCT`">
              <img class="balance-icon" src="@/assets/img/coin-white.png" />
              <div>{{ totalFctBalanceText.rounded }} FCT</div>
            </div>
          </v-sheet>
        </v-flex>
        <v-flex xs12 md6>
          <v-sheet color="primary" class="white--text display-1 font-weight-medium">
            <div class="total-balance" :title="`${totalEcBalanceText} EC`">
              <img class="balance-icon" src="@/assets/img/entry-credit.png" />
              <div>{{ totalEcBalanceText }} EC</div>
            </div>
          </v-sheet>
        </v-flex>
      </v-layout>
    </v-flex>
    <v-flex xs12>
      <v-toolbar tabs card color="primary">
        <v-icon large>list</v-icon>

        <v-toolbar-title>Manage Addresses</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-toolbar-items>
          <v-btn flat @click="generateAddress()">Generate</v-btn>
          <v-btn flat @click.stop="$refs.addressImportDialog.show()">Import</v-btn>
        </v-toolbar-items>

        <v-tabs slot="extension" v-model="tab" grow color="primary">
          <v-tabs-slider></v-tabs-slider>

          <v-tab>Factoid</v-tab>
          <v-tab>Entry Credit</v-tab>
        </v-tabs>
      </v-toolbar>

      <v-tabs-items v-model="tab">
        <v-tab-item>
          <v-data-table
            :headers="[
              { text: 'Address', value: 'address' },
              { text: 'Name', value: 'name' },
              ,
              { text: 'Balance', value: 'balance' }
            ]"
            :items="fctAddresses"
            item-key="address"
            disable-initial-sort
            :loading="loading"
            class="elevation-1"
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
                {{ props.item.balance }}
              </td>
            </template>
          </v-data-table>
        </v-tab-item>
        <v-tab-item>
          <v-data-table
            :headers="[
              { text: '', value: 'prefered', sortable: false },
              { text: 'Address', value: 'address' },
              { text: 'Name', value: 'name' },
              { text: 'Balance', value: 'balance' }
            ]"
            :items="ecAddresses"
            item-key="address"
            disable-initial-sort
            class="elevation-1"
          >
            <template slot="items" slot-scope="props">
              <td>
                <v-icon v-if="props.item.preferred" color="secondary">star</v-icon>
                <v-icon v-else @click="setPreferredEcAddress(props.item.address)">star_outline</v-icon>
              </td>
              <td>{{ props.item.address }}</td>
              <td>
                <v-edit-dialog lazy>
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
              <td>{{ props.item.balance }}</td>
            </template>
          </v-data-table>
        </v-tab-item>
      </v-tabs-items>
    </v-flex>
    <AddressImportDialog ref="addressImportDialog"></AddressImportDialog>
  </v-layout>
</template>

<script>
import Big from 'bignumber.js';
import AddressImportDialog from './Addresses/AddressImportDialog';

export default {
  components: { AddressImportDialog },
  data: function() {
    return {
      tab: null,
      loading: false
    };
  },
  async mounted() {
    this.loading = true;
    try {
      await this.$store.dispatch('address/fetchBalances');
    } finally {
      this.loading = false;
    }
  },
  computed: {
    totalFctBalanceText() {
      const fctSum = this.$store.getters['address/totalFctBalance'].div(100000000);
      return {
        rounded: fctSum.toFormat(5),
        exact: fctSum.toFormat()
      };
    },
    totalEcBalanceText() {
      return this.$store.getters['address/totalEcBalance'].toFormat();
    },
    preferredEcAddress() {
      return this.$store.state.address.preferredEcAddress;
    },
    fctAddresses() {
      const balances = this.$store.state.address.fctBalances;
      return this.$store.getters['address/fctAddressesWithNames'].map(o =>
        Object.assign(
          {
            balance: (balances[o.address] || new Big(0)).div(100000000).toFormat()
          },
          o
        )
      );
    },
    ecAddresses() {
      const balances = this.$store.state.address.ecBalances;
      return this.$store.getters['address/ecAddressesWithNames'].map(o =>
        Object.assign(
          {
            preferred: o.address === this.preferredEcAddress,
            balance: (balances[o.address] || new Big(0)).toFormat()
          },
          o
        )
      );
    },
    selectedAddressType() {
      switch (this.tab) {
        case 0:
          return 'factoid';
        case 1:
          return 'ec';
        default:
          throw new Error('unknown tab');
      }
    }
  },
  methods: {
    async generateAddress() {
      try {
        const type = this.selectedAddressType;
        await this.$store.dispatch('address/generateAddress', type);
        const message = `New ${type} address generated`;
        this.$store.commit('snackSuccess', message);
      } catch (e) {
        this.$store.commit('snackError', e.message);
      }
    },
    updateAddressName(address, name) {
      this.$store.commit('address/updateAddressNames', { address, name });
    },
    setPreferredEcAddress(address) {
      this.$store.commit('address/setPreferredEcAddress', address);
    }
  }
};
</script>

<style scoped>
.balance-icon {
  margin-right: 24px;
}
.total-balance {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px;
}
</style>
