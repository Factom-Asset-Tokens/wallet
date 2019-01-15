<template>
  <v-app dark>
    <SideBar></SideBar>
    <v-content>
      <v-container fluid>
        <router-view id="router-view"/>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import SideBar from "./views/SideBar";

export default {
  name: "App",
  components: {
    SideBar
  }
};
</script>

<style scoped>
</style>
