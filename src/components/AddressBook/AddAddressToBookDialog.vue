<template>
  <v-dialog v-model="display" lazy max-width="650px" @keydown.esc="display = false">
    <v-card>
      <v-card-title class="headline primary white--text" primary-title>Add Address to Book</v-card-title>
      <v-card-text>
        <v-container>
          <v-form v-model="valid" ref="form">
            <v-layout wrap>
              <v-flex xs12>
                <v-text-field
                  v-model="address"
                  :rules="addressRules"
                  label="Public FCT or EC address"
                  counter="52"
                  ref="addressInput"
                  autofocus
                  box
                  required
                ></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-text-field v-model.trim="name" label="Name (Recommended)" box></v-text-field>
              </v-flex>
            </v-layout>
          </v-form>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" flat outline @click="display = false">Close</v-btn>
        <v-btn color="primary" @click="addAddressToBook" :disabled="!valid">Add to book</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { isValidPublicAddress } from 'factom';

export default {
  data: function() {
    return {
      display: false,
      valid: true,
      address: '',
      name: '',
      addressRules: [
        v => !this.display || isValidPublicAddress(v) || 'Invalid public FCT or EC address',
        v => !this.display || !this.bookAddresses.has(v) || 'Address already in your address book'
      ]
    };
  },
  computed: {
    bookAddresses() {
      return new Set(this.$store.state.address.bookAddresses);
    }
  },
  methods: {
    show() {
      this.display = true;
    },
    addAddressToBook() {
      if (this.$refs.form.validate()) {
        if (this.name) {
          this.$store.commit('address/updateAddressNames', {
            address: this.address,
            name: this.name
          });
        }
        this.$store.commit('address/addAddressToBook', this.address);
        this.display = false;
      }
    }
  },
  watch: {
    display() {
      if (this.display) {
        if (this.$refs.form) {
          this.$refs.form.reset();
        }

        if (this.$refs.addressInput) {
          this.$nextTick(this.$refs.addressInput.focus);
        }
      }
    }
  }
};
</script>

<style scoped></style>
