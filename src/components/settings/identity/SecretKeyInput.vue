<template>
  <v-text-field
    autofocus
    ref="input"
    v-model="secretKey"
    :append-icon="show ? 'visibility_off' : 'visibility'"
    :rules="rules"
    :type="show ? 'text' : 'password'"
    placeholder="Secret identity key"
    @click:append="show = !show"
    @input="$emit('input', secretKey)"
  ></v-text-field>
</template>

<script>
import { digital } from "factom-identity-lib";
const { isValidSecretIdentityKey } = digital;

export default {
  props: ["validationRules"],
  data: () => ({
    show: false,
    secretKey: ""
  }),
  computed: {
    rules: function() {
      return [
        v =>
          !v || isValidSecretIdentityKey(v) || "Not a valid secret identity key"
      ].concat(this.validationRules || []);
    }
  },
  methods: {
    focus() {
      this.$refs.input.focus();
    }
  }
};
</script>

<style scoped>
</style>
