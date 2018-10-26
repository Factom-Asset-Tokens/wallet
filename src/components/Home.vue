<template>
  <div class="hello">
      Fatd endpoint configured: {{fatdEndPoint}}
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "HelloWorld",
  computed: mapGetters(["fatdEndPoint"])
};
</script>

<style scoped>
</style>
