<template>
  <v-container>
    <AddressSettings class="section-margin-bottom"></AddressSettings>
    <DaemonSettings class="section-margin-bottom"></DaemonSettings>
  </v-container>
</template>

<script>
import DaemonSettings from "@/components/settings/DaemonSettings";
import AddressSettings from "@/components/settings/AddressSettings";

export default {
  name: "Settings",
  components: { DaemonSettings, AddressSettings },
  mounted() {
    this.$store.dispatch("walletd/init");
    this.$store.dispatch("fatd/init");
  }
};
</script>

<style scoped>
.section-margin-bottom {
  margin-bottom: 48px;
}
</style>
