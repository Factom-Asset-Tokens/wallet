<template>
  <v-dialog v-model="display" lazy max-width="600px" @keydown.esc="display = false">
    <v-card>
      <v-card-title class="primary">
        <span class="headline">Create Identity</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-form v-model="valid" ref="form">
            <v-layout wrap>
              <v-flex xs12>
                <v-combobox
                  ref="tags"
                  autofocus
                  v-model="tags"
                  label="Add multiple tags that will identify the new identity"
                  multiple
                  deletable-chips
                  persistent-hint
                  append-icon
                  :rules="tagRules"
                  chips
                ></v-combobox>
              </v-flex>
              <v-flex xs12>
                <v-select v-model="numberOfKeys" :items="numberOfKeysSelect" label="Number of identity keys"></v-select>
              </v-flex>
              <v-flex xs12 mt-1>
                <v-alert :value="true" type="info" outline>Creating an identity costs 11 Entry Credits.</v-alert>
              </v-flex>
              <v-flex>
                <v-alert :value="createError" color="error" icon="warning" outline>{{ createError }}</v-alert>
              </v-flex>
            </v-layout>
          </v-form>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" flat outline @click="display = false">Close</v-btn>
        <v-btn color="primary" @click="create" :disabled="!valid" :loading="createLoading">Create</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data: function() {
    return {
      display: false,
      valid: true,
      createLoading: false,
      tags: ['FAT'],
      numberOfKeysSelect: [2, 3, 4, 5, 6, 7, 8, 9],
      numberOfKeys: 3,
      createError: '',
      tagRules: [v => v.length > 0 || 'At least one tag is required']
    };
  },
  methods: {
    show() {
      this.display = true;
    },
    async create() {
      if (this.$refs.form.validate()) {
        this.createLoading = true;
        this.createError = '';
        try {
          const payingEcAddress = await this.$store.dispatch('address/getPayingEcSecretKey');

          if (!payingEcAddress) {
            throw new Error('No Entry Credit available to pay for the transaction.');
          }

          await this.$store.dispatch('identity/generateIdentity', {
            numberOfKeys: this.numberOfKeys,
            payingEcAddress,
            name: this.tags
          });

          this.display = false;
        } catch (e) {
          this.createError = e.message.includes('already exists')
            ? 'An identity chain already exists with those tags.'
            : e.message;
        } finally {
          this.createLoading = false;
        }
      }
    }
  },
  watch: {
    display() {
      if (this.display) {
        this.createLoading = false;
        this.tags = ['FAT'];
        this.numberOfKeys = 3;
        this.createError = '';
        if (this.$refs.tags) {
          this.$nextTick(this.$refs.tags.focus);
        }
      } else {
        this.$refs.form.reset();
      }
    }
  }
};
</script>

<style scoped></style>
