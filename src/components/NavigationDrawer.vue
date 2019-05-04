<template>
  <v-navigation-drawer dark permanent app floating right>
    <v-container>
      <slot></slot>
    </v-container>
    <v-list :subheader="hasSection">
      <v-divider></v-divider>

      <template v-for="e in items">
        <v-list-tile
          v-if="e.to"
          :key="e.icon + '_' + e.text"
          avatar
          :to="'?view=' + e.to"
          exact
          color="secondary"
          exact-active-class="active-nav-element"
        >
          <v-list-tile-action>
            <v-icon color="secondary">{{ e.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title class="secondary--text subheading">{{ e.text }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-subheader v-else :key="e.text" class="primary--text">{{ e.text }}</v-subheader>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: 'NavigationDrawer',
  props: {
    items: {
      type: Array,
      required: true
    }
  },
  computed: {
    hasSection() {
      return this.items.some(e => !e.to);
    }
  }
};
</script>
