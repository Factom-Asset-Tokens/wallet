<template>
  <div id="sidebar">

    <router-link id="settings-link" to="/settings">
      <i class="material-icons" style="color: #ffffff; font-size: 28px">settings</i>         
    </router-link>
  </div>
</template>

<script>
export default {
  name: "SideBar",
  data() {
    return {};
  }
};
</script>


<style>
#sidebar {
  position: absolute;
  top: 50%;
  left: 0%;
  transform: translate(0%, -50%);
  background-color: #959595;
  height: 100%;
  width: 100px;
}

#settings-link {
  margin-bottom: 8px;
  width: 100%;
  text-align: center;
  position: absolute;
  bottom: 0;
}
</style>
