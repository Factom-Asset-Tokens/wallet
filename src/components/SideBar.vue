<template>
  <div id="sidebar">

      <router-link id="add-token-link" to="/">
        <div style="padding: 8px; height: 72px;width: 72px; border-radius: 50%; border: 2px dashed white; cursor: pointer; text-align: center">
         <div><i class="material-icons" style="color: white; margin-top: 10px; font-size: 32px">add</i></div>
        </div>
      </router-link>

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
