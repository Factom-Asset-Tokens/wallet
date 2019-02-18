<template>
  <v-container>
    <IdentitySettings class="section-margin-bottom"></IdentitySettings>
    <DaemonSettings class="section-margin-bottom"></DaemonSettings>
    <Backup></Backup>
    <v-layout>
      <v-flex xs12 mt-5 text-xs-center>FAT Wallet v{{version}}</v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import DaemonSettings from "@/components/Settings/DaemonSettings";
import IdentitySettings from "@/components/Settings/IdentitySettings";
import Backup from "@/components/Settings/Backup";
import { version } from "@/../package.json";

export default {
  name: "Settings",
  components: { DaemonSettings, IdentitySettings, Backup },
  data() {
    return {
      version: version
    }
  },
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
