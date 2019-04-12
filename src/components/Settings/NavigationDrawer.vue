<template>
  <v-navigation-drawer dark permanent app floating right>
    <v-container>
      <v-flex text-xs-center class="title">
        FAT Wallet
      </v-flex>
      <v-flex text-xs-center class="font-italic subheading"> v{{ version }} </v-flex>
    </v-container>
    <v-list>
      <v-divider></v-divider>

      <v-list-tile
        avatar
        to="?view=connection"
        exact
        color="secondary"
        exact-active-class="secondary--text active-nav-element"
      >
        <v-list-tile-action>
          <v-icon color="secondary">wifi</v-icon>
        </v-list-tile-action>
        <v-list-tile-content class="subheading">
          <v-list-tile-title>Connection</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile
        avatar
        to="?view=identity"
        exact
        color="secondary"
        exact-active-class="secondary--text active-nav-element"
      >
        <v-list-tile-action>
          <v-icon color="secondary">fingerprint</v-icon>
        </v-list-tile-action>
        <v-list-tile-content class="subheading">
          <v-list-tile-title>Identity</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile
        avatar
        to="?view=backup"
        exact
        color="secondary"
        exact-active-class="secondary--text active-nav-element"
      >
        <v-list-tile-action>
          <v-icon color="secondary">settings_backup_restore</v-icon>
        </v-list-tile-action>
        <v-list-tile-content class="subheading">
          <v-list-tile-title>Backup</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { version } from '@/../package.json';

export default {
  props: ['tokenId'],
  data() {
    return {
      version
    };
  }
};
</script>
