<template>
  <div>
    <v-container>
      <IdentitySettings v-if="showComponent === 'identity'" class="section-margin-bottom"></IdentitySettings>
      <DaemonSettings v-else-if="showComponent === 'connection'" class="section-margin-bottom"></DaemonSettings>
      <Backup v-if="showComponent === 'backup'"></Backup>
    </v-container>
    <NavigationDrawer @show="showComponent = $event"></NavigationDrawer>
  </div>
</template>

<script>
import DaemonSettings from '@/components/Settings/DaemonSettings';
import IdentitySettings from '@/components/Settings/IdentitySettings';
import Backup from '@/components/Settings/Backup';
import NavigationDrawer from '@/components/Settings/NavigationDrawer';

export default {
  name: 'Settings',
  components: { DaemonSettings, IdentitySettings, Backup, NavigationDrawer },
  data() {
    return {
      showComponent: 'identity'
    };
  },
  mounted() {
    this.$store.dispatch('init');
  }
};
</script>

<style scoped>
.section-margin-bottom {
  margin-bottom: 48px;
}
</style>
