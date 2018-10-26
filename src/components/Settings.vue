<template>
  <div id="settings">
      <div class="setting-group">
          <div class="setting-group-title">FAT Daemon</div>
          <div class="setting">Host: <input v-model="fatdHost" type="text"/></div>
          <div class="setting">Port: <input v-model="fatdPort" type="number"/></div>
      </div>
  </div>
</template>

<script>
export default {
  name: "Settings",
  computed: {
    fatdHost: {
      get() {
        return this.$store.state.settings.fatd.host;
      },
      set(value) {
        this.$store.commit("updateFatdHost", value);
      }
    },
    fatdPort: {
      get() {
        return this.$store.state.settings.fatd.port;
      },
      set(value) {
        this.$store.commit("updateFatdPort", value);
      }
    }
  }
};
</script>


<style>
</style>
