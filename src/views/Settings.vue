<template>
  <div>
    <v-container>
      <DaemonSettings v-if="view === 'connection'" class="section-margin-bottom"></DaemonSettings>
      <IdentitySettings v-else-if="view === 'identity'" class="section-margin-bottom"></IdentitySettings>
      <Backup v-if="view === 'backup'"></Backup>
    </v-container>
    <NavigationDrawer></NavigationDrawer>
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
    return {};
  },
  computed: {
    view() {
      return this.$route.query.view;
    }
  }
};
</script>

<style scoped>
.section-margin-bottom {
  margin-bottom: 48px;
}
</style>
