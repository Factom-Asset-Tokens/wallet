<template>
  <v-container>
    <DaemonSettings class="section-margin-bottom"></DaemonSettings>
    <AddressSettings></AddressSettings>
  </v-container>
</template>

<script>
import DaemonSettings from "@/components/DaemonSettings";
import AddressSettings from "@/components/AddressSettings";

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
