<template>
  <v-layout>
    <v-flex xs12>
      <v-toolbar tabs card color="primary">
        <v-icon large>list</v-icon>

        <v-toolbar-title>Addresses</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-toolbar-items>
          <v-btn flat :disabled="!walletdOk" @click="generateAddress()">Generate</v-btn>
          <v-btn flat :disabled="!walletdOk" @click.stop="$refs.addressImportDialog.show()">Import</v-btn>
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
            :headers="[{text: 'Address', value: 'address'}, {text: 'Name', value: 'name'}, , {text: 'Balance', value: 'balance'}]"
            :items="fctAddresses"
            disable-initial-sort
            :loading="loading"
            class="elevation-1"
          >
            <template slot="items" slot-scope="props">
              <td>{{ props.item.address }}</td>
              <td>
                <v-edit-dialog :return-value.sync="props.item.name" lazy>
                  {{ props.item.name}}
                  <v-text-field
                    slot="input"
                    :value="props.item.name"
                    @input="updateAddressName(props.item.address, $event)"
                    label="Edit"
                    single-line
                  ></v-text-field>
                </v-edit-dialog>
              </td>
              <td>{{ (props.item.balance / 100000000).toLocaleString(undefined, {maximumFractionDigits:8}) }}</td>
            </template>
          </v-data-table>
        </v-tab-item>
        <v-tab-item>
          <v-data-table
            :headers="[{text: '', value: 'prefered', sortable: false}, {text: 'Address', value: 'address'}, {text: 'Name', value: 'name'}, {text: 'Balance', value: 'balance'}]"
            :items="ecAddresses"
            disable-initial-sort
            class="elevation-1"
          >
            <template slot="items" slot-scope="props">
              <td>
                <v-icon v-if="props.item.preferred" color="yellow darken-3">star</v-icon>
                <v-icon v-else @click="setPreferredEcAddress(props.item.address)">star_outline</v-icon>
              </td>
              <td>{{ props.item.address }}</td>
              <td>
                <v-edit-dialog lazy>
                  {{ props.item.name}}
                  <v-text-field
                    slot="input"
                    :value="props.item.name"
                    @input="updateAddressName(props.item.address, $event)"
                    label="Edit"
                    single-line
                  ></v-text-field>
                </v-edit-dialog>
              </td>
              <td>{{ props.item.balance.toLocaleString() }}</td>
            </template>
          </v-data-table>
        </v-tab-item>
      </v-tabs-items>
    </v-flex>
    <v-snackbar v-model="snackError" color="error" :timeout="5000">
      {{ snackErrorMessage }}
      <v-btn dark flat @click="snackError = false">Close</v-btn>
    </v-snackbar>
    <v-snackbar v-model="snackSuccess" color="success" :timeout="5000">
      {{ snackSuccessMessage }}
      <v-btn dark flat @click="snackSuccess = false">Close</v-btn>
    </v-snackbar>
    <AddressImportDialog ref="addressImportDialog"></AddressImportDialog>
  </v-layout>
</template>

<script>
import AddressImportDialog from "@/components/fct/AddressImportDialog";

export default {
  components: { AddressImportDialog },
  data: function() {
    return {
      tab: null,
      snackError: false,
      snackErrorMessage: "",
      snackSuccess: false,
      snackSuccessMessage: "",
      loading: false
    };
  },
  async mounted() {
    this.loading = true;
    try {
      await Promise.all([
        this.$store.dispatch("walletd/checkStatus"),
        this.$store.dispatch("factomd/checkStatus")
      ]);
      await this.$store.dispatch("address/init");
    } finally {
      this.loading = false;
    }
  },
  computed: {
    preferredEcAddress() {
      return this.$store.state.address.preferredEcAddress;
    },
    fctAddresses() {
      const balances = this.$store.state.address.fctBalances;
      return this.$store.getters["address/fctAddressesWithNames"].map(o =>
        Object.assign(
          {
            balance: balances[o.address] || 0
          },
          o
        )
      );
    },
    ecAddresses() {
      const balances = this.$store.state.address.ecBalances;
      return this.$store.getters["address/ecAddressesWithNames"].map(o =>
        Object.assign(
          {
            preferred: o.address === this.preferredEcAddress,
            balance: balances[o.address] || 0
          },
          o
        )
      );
    },
    walletdOk() {
      return this.$store.state.walletd.status === "ok";
    },
    selectedAddressType() {
      switch (this.tab) {
        case 0:
          return "factoid";
        case 1:
          return "ec";
        default:
          throw new Error("unknown tab");
      }
    }
  },
  methods: {
    async generateAddress() {
      const cli = this.$store.getters["walletd/cli"];
      try {
        await cli.call(`generate-${this.selectedAddressType}-address`);
        this.$store.dispatch("address/init");
        this.snackSuccessMessage = `New ${
          this.selectedAddressType
        } address generated`;
        this.snackSuccess = true;
      } catch (e) {
        this.snackErrorMessage = e.message;
        this.snackError = true;
      }
    },
    updateAddressName(address, name) {
      this.$store.commit("address/updateAddressNames", { address, name });
    },
    setPreferredEcAddress(address) {
      this.$store.commit("address/setPreferredEcAddress", address);
    }
  }
};
</script>


<style scoped>
</style>
