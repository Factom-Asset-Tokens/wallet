<template>
  <div id="main-container">
      <SideBar></SideBar>
      <v-app>
        <router-view id="router-view"/>
      </v-app>
  </div>
</template>

<script>
import SideBar from "./components/SideBar";

export default {
  name: "App",
  components: {
    SideBar
  }
};
</script>

<style scoped>
#main-container {
  font-family: "Roboto Slab", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding-left: 100px;
}

#router-view {
  padding: 22px;
}
</style>
