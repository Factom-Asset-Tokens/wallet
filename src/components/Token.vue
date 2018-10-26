<template>
  <div>
      <div v-if="token">
        Token Info: {{token}}
      </div>
      <div v-else>
          Token at chain ID {{chainId}} is not currently tracked.
      </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "Token",
  computed: {
    chainId() {
      return this.$route.params.chainid;
    },
    token() {
      return this.$store.state.trackedTokens[this.chainId];
    }
  }
};
</script>

<style scoped>
</style>
