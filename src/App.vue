<template>
  <v-app dark>
    <SideBar></SideBar>
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
import SideBar from './views/SideBar';
import { mapState } from 'vuex';

export default {
  name: 'App',
  components: {
    SideBar
  },
  computed: {
    ...mapState(['snackMessage', 'snackColor']),
    snack: {
      get() {
        return this.$store.state.snack;
      },
      set(value) {
        this.$store.commit('updateSnack', value);
      }
    }
  }
};
</script>

<style scoped></style>
