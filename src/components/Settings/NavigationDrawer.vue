<template>
  <NavigationDrawer :items="items">
    <v-flex text-xs-center class="title">
      FAT Wallet
    </v-flex>
    <v-flex text-xs-center class="font-italic subheading"> v{{ version }} </v-flex>
  </NavigationDrawer>
</template>

<script>
import NavigationDrawer from '@/components/NavigationDrawer';
import { version } from '@/../package.json';

export default {
  components: { NavigationDrawer },
  data() {
    return {
      version,
      items: [
        { text: 'Connection', icon: 'wifi', to: 'connection' },
        { text: 'Identity', icon: 'fingerprint', to: 'identity' },
        { text: 'Change password', icon: 'lock', to: 'password' },
        { text: 'Backup', icon: 'settings_backup_restore', to: 'backup' }
      ]
    };
  }
};
</script>
