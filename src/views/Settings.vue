<template>
  <div>
    <v-container>
      <DaemonSettings v-if="view === 'connection'" class="section-margin-bottom"></DaemonSettings>
      <IdentitySettings v-else-if="view === 'identity'" class="section-margin-bottom"></IdentitySettings>
      <PasswordChange v-else-if="view === 'password'"></PasswordChange>
      <Backup v-else-if="view === 'backup'"></Backup>
    </v-container>
    <NavigationDrawer></NavigationDrawer>
  </div>
</template>

<script>
import DaemonSettings from '@/components/Settings/DaemonSettings';
import IdentitySettings from '@/components/Settings/IdentitySettings';
import Backup from '@/components/Settings/Backup';
import PasswordChange from '@/components/Settings/PasswordChange';
import NavigationDrawer from '@/components/Settings/NavigationDrawer';

export default {
  name: 'Settings',
  components: { DaemonSettings, IdentitySettings, PasswordChange, Backup, NavigationDrawer },
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
