<template>
  <v-navigation-drawer dark permanent app floating right>
    <v-container>
      <v-flex text-xs-center class="subheading">
        FAT Walllet
      </v-flex>
      <v-flex text-xs-center class="font-italic subheading"> v{{ version }} </v-flex>
    </v-container>
    <v-list>
      <v-list-tile avatar @click="$emit('show', 'identity')">
        <v-list-tile-action>
          <v-icon color="secondary">fingerprint</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title class="secondary--text subheading">Identity</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile avatar @click="$emit('show', 'connection')">
        <v-list-tile-action>
          <v-icon color="secondary">wifi</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title class="secondary--text subheading">Connection</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile avatar @click="$emit('show', 'backup')">
        <v-list-tile-action>
          <v-icon color="secondary">settings_backup_restore</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title class="secondary--text subheading">Backup</v-list-tile-title>
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
