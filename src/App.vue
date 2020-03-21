<template>
  <v-app dark>
    <SideBar v-if="displayAppSideBar"></SideBar>
    <v-content>
      <v-container fluid>
        <router-view id="router-view" />
        <v-snackbar v-model="snack" :color="snackColor" :timeout="5000">
          {{ snackMessage }}
          <v-btn dark flat @click="snack = false">Close</v-btn>
        </v-snackbar>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
const { app } = require('electron').remote;
import Store from 'electron-store';
import semverLte from 'semver/functions/lte';
import SideBar from './views/SideBar';
import { mapState } from 'vuex';

const appStore = new Store({ name: 'user-config.v1' });

export default {
  name: 'App',
  components: {
    SideBar
  },
  computed: {
    ...mapState(['snackMessage', 'snackColor', 'displayAppSideBar']),
    snack: {
      get() {
        return this.$store.state.snack;
      },
      set(value) {
        this.$store.commit('updateSnack', value);
      }
    }
  },
  mounted() {
    const latestVersionOpened = appStore.get('latestVersionOpened');
    if (latestVersionOpened) {
      // Version 1.0.2 (and prior) were using the Ledger legacy path
      if (semverLte(latestVersionOpened, '1.0.2')) {
        this.$store.commit('ledger/setLegacyDerivation', true);
      }
    }

    appStore.set('latestVersionOpened', app.getVersion());
  }
};
</script>

<style scoped></style>
