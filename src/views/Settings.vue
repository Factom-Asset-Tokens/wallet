<template>
  <div id="settings">
    <DaemonSettings></DaemonSettings>
    <AddressSettings></AddressSettings>
  </div>
</template>

<script>
import DaemonSettings from "@/components/DaemonSettings";
import AddressSettings from "@/components/AddressSettings";

export default {
  name: "Settings",
  components: { DaemonSettings, AddressSettings },
  mounted() {
    // TODO: should be done once at the startup of the whole application
    this.$store.dispatch("walletd/init");
    this.$store.dispatch("fatd/init");
  }
};
</script>


<style scoped>
</style>
