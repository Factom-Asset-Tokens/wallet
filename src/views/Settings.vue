<template>
  <v-container>
    <AddressSettings class="section-margin-bottom"></AddressSettings>
    <IdentitySettings class="section-margin-bottom"></IdentitySettings>
    <DaemonSettings class="section-margin-bottom"></DaemonSettings>
  </v-container>
</template>

<script>
import DaemonSettings from "@/components/settings/DaemonSettings";
import AddressSettings from "@/components/settings/AddressSettings";
import IdentitySettings from "@/components/settings/IdentitySettings";

export default {
  name: "Settings",
  components: { DaemonSettings, AddressSettings, IdentitySettings },
  mounted() {
    this.$store.dispatch("walletd/init");
    this.$store.dispatch("fatd/init");
    this.$store.dispatch("identity/init");
  }
};
</script>

<style scoped>
.section-margin-bottom {
  margin-bottom: 48px;
}
</style>
