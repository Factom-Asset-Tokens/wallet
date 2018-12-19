<template>
  <v-text-field
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
const { getPublicIdentityKey, isValidSecretIdentityKey } = digital;

export default {
  props: ["missingKeys"],
  data: () => ({
    show: false,
    secretKey: ""
  }),
  computed: {
    rules: function() {
      const that = this;
      return [
        v =>
          !v ||
          isValidSecretIdentityKey(v) ||
          "Not a valid secret identity key",
        v =>
          !v ||
          (isValidSecretIdentityKey(v) &&
            that.missingKeys.has(getPublicIdentityKey(v))) ||
          "Not a secret key missing for this identity"
      ];
    }
  }
};
</script>

<style scoped>
</style>
