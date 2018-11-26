<template>
  <v-form ref="form" v-model="valid" lazy-validation>
    <h1>Track an existing token</h1>
    <v-text-field class="global-token-id"
      v-model="tokenChainId"
      :rules="tokenChainIdRules"
      label="Token chain ID"
      required
    ></v-text-field>

    <v-btn :disabled="!valid"  @click="submit">
      track
    </v-btn>
    <v-btn @click="clear">clear</v-btn>
  </v-form>
</template>

<script>
export default {
  name: "AddToken",
  data: () => ({
    valid: true,
    tokenChainId: "",
    tokenChainIdRules: [
      v => !!v || "Token chain ID is required",
      v => (v && v.length === 64) || "Token chain ID must be 64 characters"
    ]
  }),

  methods: {
    submit() {
      if (this.$refs.form.validate()) {
        // TODO
      }
    },
    clear() {
      this.$refs.form.reset();
    }
  }
};
</script>

<style scoped>
.global-token-id {
  width: 600px;
}
</style>
