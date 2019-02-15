<template>
  <v-container>
    <IdentitySettings class="section-margin-bottom"></IdentitySettings>
    <DaemonSettings class="section-margin-bottom"></DaemonSettings>
    <Backup></Backup>
  </v-container>
</template>

<script>
import DaemonSettings from "@/components/Settings/DaemonSettings";
import IdentitySettings from "@/components/Settings/IdentitySettings";
import Backup from "@/components/Settings/Backup";

export default {
  name: "Settings",
  components: { DaemonSettings, IdentitySettings, Backup },
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
