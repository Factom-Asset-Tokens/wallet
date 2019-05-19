<template>
  <v-dialog v-model="display" lazy max-width="650px" @keydown.esc="display = false">
    <v-card>
      <v-form @submit.prevent="save">
        <v-card-title class="headline primary white--text" primary-title>Edit Address Name</v-card-title>
        <v-card-text>
          <v-layout wrap>
            <v-flex xs12 class="secondary--text subheading" my-3>
              {{ address }}
            </v-flex>
            <v-flex xs12>
              <v-text-field v-model.trim="name" label="Name" box autofocus ref="nameInput"></v-text-field>
            </v-flex>
          </v-layout>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" flat outline @click="display = false">Close</v-btn>
          <v-btn color="primary" type="submit">Save</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data: function() {
    return {
      display: false,
      address: '',
      name: ''
    };
  },
  methods: {
    show(address) {
      this.display = true;
      this.address = address;
      this.name = this.$store.state.address.names[address];
    },
    save() {
      this.$store.commit('address/updateAddressNames', {
        address: this.address,
        name: this.name
      });

      this.display = false;
    }
  },
  watch: {
    display() {
      if (this.display) {
        if (this.$refs.nameInput) {
          this.$nextTick(this.$refs.nameInput.focus);
        }
      }
    }
  }
};
</script>

<style scoped></style>
