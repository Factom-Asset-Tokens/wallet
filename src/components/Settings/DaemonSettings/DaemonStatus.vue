<template>
  <div v-if="status === 'ok'" class="d-inline">
    <v-icon color="#AECC6F">check_circle</v-icon> <span class="subheading version-text font-italic">(v{{version}})</span>
  </div>
  <v-icon v-else-if="status === 'ko'" color="error">cancel</v-icon>
  <v-progress-circular v-else indeterminate color="primary"></v-progress-circular>
</template>

<script>
export default {
  name: "DaemonStatus",
  props: ["status", "version"]
};
</script>


<style scoped>
.version-text {
    margin-left: 8px;
}
</style>
