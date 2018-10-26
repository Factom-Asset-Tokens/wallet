<template>
  <div id="sidebar">

    <router-link class="tracked-token tooltip" v-for="token in trackedTokens" v-bind:key="token.chainId" :to="`/token/${token.chainId}`">
      <img class="token-icon" :src="token.iconSrc">
      <span class="tooltiptext">{{token.displayName}}</span>
      <i v-show="$route.path === `/token/${token.chainId}`" class="material-icons select-arrow">arrow_right</i>
    </router-link>

    <router-link class="token-add" to="/">
      <i class="material-icons token-add-icon">add</i>
      <i v-show="$route.path === '/'" class="material-icons select-arrow">arrow_right</i>
    </router-link>

    <router-link id="settings-link" to="/settings">
      <i class="material-icons settings-icon">settings</i>         
    </router-link>
  </div>
</template>

<script>
export default {
  name: "SideBar",
  computed: {
    trackedTokens() {
      return Object.values(this.$store.state.trackedTokens);
    }
  }
};
</script>


<style scoped>
#sidebar {
  position: absolute;
  top: 50%;
  left: 0%;
  transform: translate(0%, -50%);
  background-color: #959595;
  height: 100%;
  width: 100px;
  padding: 9px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}

a {
  outline: 0;
  border: none;
  outline-style: none;
}

.token-add {
  width: 72px;
  height: 72px;
  border-radius: 100%;
  border: 2px dashed white;
  margin: 8px 0;
  position: relative;
}

.token-add-icon {
  position: absolute;
  color: white;
  font-size: 28px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.tracked-token {
  display: block;
  background: white;
  border-radius: 100%;
  position: relative;
  width: 72px;
  height: 72px;
  margin: 8px 0;
}
.token-icon {
  width: 56px;
  height: 56px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.select-arrow {
  color: white;
  position: absolute;
  left: -23px;
  top: 50%;
  transform: translateY(-50%);
}

#settings-link {
  margin-bottom: 8px;
  width: 100%;
  text-align: center;
  position: absolute;
  bottom: 0;
}

.tooltip {
    position: relative;
    display: inline-block;
}

/* Tooltip text */
.tooltip .tooltiptext {
    visibility: hidden;
    min-width: 130px;
    max-lines: 1;
    background-color: black;
    color: #fff;
    text-align: center;
    padding: 5px 0;
    /*border-radius: 6px;*/

    /* Position the tooltip text - see examples below! */
    position: absolute;
    z-index: 1000;

    top: 30%;
    left: 110%;
}

.tooltip .tooltiptext::after {
    content: " ";
    position: absolute;
    top: 50%;
    right: 100%; /* To the left of the tooltip */
    margin-top: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: transparent black transparent transparent;
}

.a::after {
    content: " ";
    position: absolute;
    top: 50%;
    right: 104%; /* To the left of the tooltip */


    margin-top: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: transparent transparent transparent white;
}

/* Show the tooltip text when you mouse over the tooltip container */
.tooltip:hover .tooltiptext {
    visibility: visible;
}

.settings-icon {
  color: #ffffff;
  font-size: 32px;
}
</style>
