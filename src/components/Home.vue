<template>
  <div>
      Fatd endpoint configured: {{fatdEndPoint}}
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "Home",
  computed: mapGetters(["fatdEndPoint"])
};
</script>

<style scoped>
</style>
