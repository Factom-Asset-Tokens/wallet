<template>
  <v-card>
    <v-toolbar>
      <v-icon>book</v-icon>
      <v-toolbar-title>Your Address Book</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-toolbar-items>
        <v-btn icon @click="$refs.addAddressToBookDialog.show()" title="Add an address to the book">
          <v-icon>add</v-icon>
        </v-btn>
      </v-toolbar-items>
    </v-toolbar>

    <v-layout wrap>
      <v-flex md12 lg6>
        <v-list two-line subheader dense>
          <v-subheader class="secondary--text">Own addresses</v-subheader>

          <v-list-tile
            v-for="item in personalAddresses"
            :key="'perso' + item.address"
            @click="$emit('address', item.address)"
          >
            <v-list-tile-content>
              <v-list-tile-title>{{ item.name ? item.name : item.address }}</v-list-tile-title>
              <v-list-tile-sub-title class="primary--text">{{ item.name ? item.address : '' }}</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-flex>
      <v-flex md12 lg6>
        <v-list two-line subheader dense>
          <v-subheader class="secondary--text">Book addresses</v-subheader>

          <v-list-tile
            v-for="(item, index) in bookAddresses"
            :key="'perso' + item.address"
            @click="$emit('address', item.address)"
          >
            <v-list-tile-content>
              <v-list-tile-title>{{ item.name ? item.name : item.address }}</v-list-tile-title>
              <v-list-tile-sub-title class="primary--text">{{ item.name ? item.address : '' }}</v-list-tile-sub-title>
            </v-list-tile-content>

            <v-list-tile-action>
              <v-menu offset-y bottom left>
                <template v-slot:activator="{ on }">
                  <v-btn icon ripple v-on="on" @click.stop="">
                    <v-icon color="grey lighten-1">more_horiz</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-tile @click="editName(item.address)">
                    <v-list-tile-title><v-icon left>edit</v-icon>Edit name</v-list-tile-title>
                  </v-list-tile>
                  <v-list-tile @click="removeFromAddressBook(index)">
                    <v-list-tile-title><v-icon left>delete</v-icon>Remove</v-list-tile-title>
                  </v-list-tile>
                </v-list>
              </v-menu>
            </v-list-tile-action>
          </v-list-tile>
          <v-list-tile v-if="bookAddresses.length === 0">
            <v-list-tile-content>
              <v-list-tile-title class="font-italic">No address added yet.</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-flex>
    </v-layout>
    <!-- Dialogs -->
    <AddAddressToBook ref="addAddressToBookDialog"></AddAddressToBook>
    <EditAddressNameDialog ref="editAddressNameDialog"></EditAddressNameDialog>
  </v-card>
</template>

<script>
import AddAddressToBook from './AddressBook/AddAddressToBookDialog';
import EditAddressNameDialog from './AddressBook/EditAddressNameDialog';

export default {
  props: ['type'],
  components: { AddAddressToBook, EditAddressNameDialog },
  data: () => ({}),
  computed: {
    personalAddresses() {
      return this.$store.getters[`address/${this.type}AddressesWithNames`];
    },
    bookAddresses() {
      return this.$store.getters['address/bookAddressesWithNames'];
    }
  },
  methods: {
    removeFromAddressBook(index) {
      this.$store.commit('address/removeFromAddressBook', index);
    },
    editName(address) {
      this.$refs.editAddressNameDialog.show(address);
    }
  }
};
</script>
