<template>
  <v-dialog v-model="display" lazy max-width="800px" persistent @keydown.esc="close" @keydown.enter="attach">
    <v-card>
      <v-card-title class="headline primary white--text" primary-title>Attach metadata</v-card-title>
      <v-card-text>
        <v-layout wrap>
          <v-flex xs12 mb-4 class="subheading">
            You can attach some metadata to your transaction. Please note that it will be
            <span class="secondary--text">publicly visible</span> by anyone on the blockchain and cannot be later edited
            or removed in any way. Do not attach any sensitive data to your transactions.
          </v-flex>
          <v-flex xs12>
            <v-textarea
              v-model="metadata"
              ref="metadataInput"
              box
              label="Metadata"
              clearable
              autofocus
              counter="9000"
            ></v-textarea>
          </v-flex>
        </v-layout>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" flat outline @click="close">Cancel</v-btn>
        <v-btn color="primary" @click="attach">Attach</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data() {
    return {
      display: false,
      metadata: ''
    };
  },
  methods: {
    show(metadata) {
      this.metadata = metadata;
      this.display = true;
      if (this.$refs.metadataInput) {
        this.$nextTick(this.$refs.metadataInput.focus);
      }
    },
    close() {
      this.display = false;
    },
    attach() {
      this.$emit('update:metadata', this.metadata);
      this.close();
    }
  }
};
</script>
