<template>
  <div v-if="status === 'ok'" class="d-inline">
    <template v-if="syncing">
      <v-icon color="#E8980C">warning</v-icon>
      <span class="syncing subheading version-text">(Syncing... {{ syncHeight }} / {{ targetHeight }})</span>
      <span class="subheading version-text font-italic">v{{ version }}</span>
    </template>
    <template v-else>
      <v-icon color="#AECC6F">check_circle</v-icon>
      <span class="subheading version-text font-italic">{{ version }}</span>
    </template>
  </div>
  <v-icon v-else-if="status === 'ko'" color="error">cancel</v-icon>
  <v-progress-circular v-else indeterminate size="24" color="primary"></v-progress-circular>
</template>

<script>
export default {
  name: 'DaemonStatus',
  props: ['status', 'version', 'syncing', 'syncHeight', 'targetHeight']
};
</script>

<style scoped>
.syncing {
  color: #e8980c;
}
.version-text {
  margin-left: 8px;
}
</style>
