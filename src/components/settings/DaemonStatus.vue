<template>
  <v-icon v-if="status === 'ok'" color="#AECC6F">check_circle</v-icon>
  <v-icon v-else-if="status === 'ko'" color="error">cancel</v-icon>
  <v-progress-circular v-else indeterminate color="primary"></v-progress-circular>
</template>

<script>
export default {
  name: "DaemonStatus",
  props: ["status"]
};
</script>


<style scoped>
</style>
