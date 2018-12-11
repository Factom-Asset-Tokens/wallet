<template>
  <v-navigation-drawer width="100" class="grey" permanent app>
    <v-layout align-center column fill-height>
      <v-tooltip right v-for="token in trackedTokens" v-bind:key="token.chainId">
        <v-btn
          fab
          depressed
          large
          slot="activator"
          color="white"
          exact
          :to="`/token/${token.chainId}`"
        >
          <img class="token-icon" :src="getTokenIcon(token)">
        </v-btn>
        <span>{{getTokenTooltip(token)}}</span>
      </v-tooltip>

      <v-tooltip right>
        <v-btn fab outline large slot="activator" color="white" exact to="/add-token">
          <v-icon>add</v-icon>
        </v-btn>
        <span>Add token</span>
      </v-tooltip>

      <v-tooltip id="settings-link" right>
        <v-btn icon flat large slot="activator" color="white" exact to="/settings">
          <v-badge v-if="settingsAlert" color="error" right overlap>
            <span slot="badge">!</span>
            <v-icon large>settings</v-icon>
          </v-badge>
          <v-icon v-else large>settings</v-icon>
        </v-btn>
        <span>Settings</span>
      </v-tooltip>
    </v-layout>
  </v-navigation-drawer>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "SideBar",
  computed: {
    ...mapState({
      walletdStatus: state => state.walletd.status,
      fatdStatus: state => state.fatd.status
    }),
    settingsAlert() {
      return this.walletdStatus === "ko" || this.fatdStatus === "ko";
    },
    trackedTokens() {
      return Object.values(this.$store.state.tokens.tracked);
    }
  },
  methods: {
    getTokenIcon(token) {
      return token.metadata && token.metadata.iconSrc
        ? token.metadata.iconSrc
        : "https://png.icons8.com/dotty/40/000000/help.png";
    },
    getTokenTooltip(token) {
      return token.issuance && token.issuance.name
        ? `${token.issuance.name} (${token.issuance.symbol})`
        : token.tokenId;
    }
  }
};
</script>

<style scoped>
a {
  outline: 0;
  border: none;
  outline-style: none;
}

.token-icon {
  width: 56px;
  height: 56px;
}

#settings-link {
  position: absolute;
  bottom: 0;
}
</style>
