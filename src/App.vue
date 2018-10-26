<template>
  <div id="app">
    <SideBar></SideBar>
    <router-view/>
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

<style>
#app {
  font-family: "Roboto Slab", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding-left: 100px;
}
</style>
