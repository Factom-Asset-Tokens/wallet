<template>
  <v-container>
    <IdentitySettings class="section-margin-bottom"></IdentitySettings>
    <DaemonSettings></DaemonSettings>
  </v-container>
</template>

<script>
import DaemonSettings from "@/components/settings/DaemonSettings";
import IdentitySettings from "@/components/settings/identity/IdentitySettings";

export default {
  name: "Settings",
  components: { DaemonSettings, IdentitySettings },
  mounted() {
    this.$store.dispatch("init");
  }
};
</script>

<style scoped>
.section-margin-bottom {
  margin-bottom: 48px;
}
</style>
