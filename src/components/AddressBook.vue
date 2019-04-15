<template>
  <v-layout>
    <v-flex xs12 sm6 offset-sm3>
      <v-card>
        <v-toolbar>
          <v-icon>book</v-icon>
          <v-toolbar-title>Your Address Book</v-toolbar-title>
        </v-toolbar>

        <v-list two-line subheader dense>
          <v-subheader class="secondary--text">Recently used</v-subheader>

          <v-list-tile v-for="item in recentlyUsed" :key="'recent-' + item" @click="$emit('address', item)">
            <v-list-tile-content>
              <v-list-tile-title>{{ item }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>

          <v-divider></v-divider>

          <v-subheader class="secondary--text">Personal addresses</v-subheader>

          <v-list-tile v-for="item in personal" :key="'perso' + item.address" @click="$emit('address', item.address)">
            <v-list-tile-content>
              <v-list-tile-title>{{ item.address }}</v-list-tile-title>
              <v-list-tile-sub-title>{{ item.name }}</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  props: ['type'],
  data: () => ({}),
  computed: {
    recentlyUsed() {
      return this.$store.state.address[`${this.type}RecentlyUsed`];
    },
    personal() {
      return this.$store.getters[`address/${this.type}AddressesWithNames`];
    }
  }
};
</script>
