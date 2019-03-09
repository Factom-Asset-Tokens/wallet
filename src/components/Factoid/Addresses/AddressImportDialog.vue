<template>
  <v-dialog v-model="display" lazy max-width="600px" @keydown.esc="display = false">
    <v-card>
      <v-card-title>
        <span class="headline">Import Address</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-form v-model="valid" ref="form">
            <v-layout wrap>
              <v-flex xs12>
                <v-text-field
                  v-model="address"
                  :append-icon="showAddress ? 'visibility_off' : 'visibility'"
                  :type="showAddress ? 'text' : 'password'"
                  @click:append="showAddress = !showAddress"
                  :rules="addressRules"
                  label="Private FCT or EC address"
                  counter="52"
                  ref="addressInput"
                  autofocus
                  required
                ></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-text-field v-model.trim="name" label="Name (Optional)"></v-text-field>
              </v-flex>
            </v-layout>
          </v-form>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" flat outline @click="display = false">Close</v-btn>
        <v-btn color="primary" @click="importAddress" :disabled="!valid">Import</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { isValidPrivateAddress, getPublicAddress } from "factom";

export default {
  data: function() {
    return {
      display: false,
      valid: true,
      showAddress: false,
      address: "",
      name: "",
      addressRules: [
        v =>
          !this.display ||
          isValidPrivateAddress(v) ||
          "Invalid private FCT or EC address"
      ]
    };
  },
  methods: {
    show() {
      this.display = true;
    },
    importAddress() {
      if (this.$refs.form.validate()) {
        if (this.name) {
          this.$store.commit("address/updateAddressNames", {
            address: getPublicAddress(this.address),
            name: this.name
          });
        }
        this.$store.dispatch("address/importAddress", this.address);
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


<style scoped>
</style>