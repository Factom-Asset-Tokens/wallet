<template>
  <v-layout>
    <v-flex xs12>
      <v-toolbar tabs>
        <v-toolbar-title>Addresses</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-toolbar-items>
          <v-btn flat :disabled="!walletdOk" @click="generateAddress()">Generate</v-btn>
          <v-btn flat :disabled="!walletdOk" @click.stop="$refs.addressImportDialog.show()">Import</v-btn>
        </v-toolbar-items>

        <v-tabs slot="extension" v-model="tab" grow>
          <v-tabs-slider></v-tabs-slider>

          <v-tab>Factoid</v-tab>
          <v-tab>Entry Credit</v-tab>
        </v-tabs>
      </v-toolbar>

      <v-tabs-items v-model="tab">
        <v-tab-item>
          <v-data-table
            :headers="[{text: 'Address', value: 'address'}, {text: 'Name', value: 'name'}]"
            :items="fctAddressesWithNames"
            disable-initial-sort
            :rows-per-page-items="[10, 25, { text: '$vuetify.dataIterator.rowsPerPageAll', value: -1 }]"
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
            </template>
          </v-data-table>
        </v-tab-item>
        <v-tab-item>
          <v-data-table
            :headers="[{text: '', value: 'prefered', sortable: false}, {text: 'Address', value: 'address'}, {text: 'Name', value: 'name'}]"
            :items="ecAddressesWithNames"
            disable-initial-sort
            :rows-per-page-items="[10, 25, { text: '$vuetify.dataIterator.rowsPerPageAll', value: -1 }]"
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
import { mapGetters, mapState } from "vuex";
import AddressImportDialog from "@/components/AddressImportDialog";

export default {
  name: "AddressSettings",
  components: { AddressImportDialog },
  data: function() {
    return {
      tab: null,
      snackError: false,
      snackErrorMessage: "",
      snackSuccess: false,
      snackSuccessMessage: ""
    };
  },
  computed: {
    ...mapState(["preferredEcAddress"]),
    ...mapGetters(["fctAddressesWithNames"]),
    ecAddressesWithNames() {
      return this.$store.getters.ecAddressesWithNames.map(o =>
        Object.assign(o, { preferred: o.address === this.preferredEcAddress })
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
        this.$store.dispatch("walletd/fetchData");
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
      this.$store.commit("updateAddressNames", { address, name });
    },
    setPreferredEcAddress(address) {
      this.$store.commit("setPreferredEcAddress", address);
    }
  }
};
</script>


<style scoped>
</style>
