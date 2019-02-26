<template>
  <v-navigation-drawer width="120" class="grad" permanent app>
    <v-layout align-center column fill-height>
      <v-tooltip class="token-margin" right>
        <v-btn fab depressed large slot="activator" color="white" exact :to="`/fct`">
          <img class="token-icon" src="@/assets/img/fct.png">
        </v-btn>
        <span>Factoid (FCT)</span>
      </v-tooltip>

      <v-tooltip
        class="token-margin"
        right
        v-for="token in trackedTokens"
        v-bind:key="token.chainId"
      >
        <v-btn
          fab
          depressed
          large
          slot="activator"
          color="white"
          class="primary--text font-weight-black title"
          exact
          :to="`/token/${token.chainId}`"
        >{{getTokenIcon(token)}}</v-btn>
        <span>{{getTokenTooltip(token)}}</span>
      </v-tooltip>

      <v-tooltip class="token-margin" right>
        <v-btn fab outline large slot="activator" color="white" exact :to="{name: 'Actions'}">
          <v-icon class="fab-button-icon-fix">more_horiz</v-icon>
        </v-btn>
        <span>Actions</span>
      </v-tooltip>

      <v-tooltip id="settings-link" right>
        <v-btn icon flat large slot="activator" color="white" exact to="/settings">
          <v-badge v-if="daemonsKo" color="error" right overlap>
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
import { mapGetters } from "vuex";

export default {
  name: "SideBar",
  computed: {
    ...mapGetters(["daemonsKo"]),
    trackedTokens() {
      return Object.values(this.$store.state.tokens.tracked);
    }
  },
  methods: {
    getTokenIcon(token) {
      return token.symbol || token.tokenId[0];
    },
    getTokenTooltip(token) {
      return token.symbol
        ? `${token.tokenId} (${token.symbol})`
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

.token-margin {
  margin-top: 8px;
}

.token-icon {
  width: 56px;
  height: 56px;
}

#settings-link {
  position: absolute;
  bottom: 0;
}

.grad {
  background-image: linear-gradient(#8ca1cd, #3e557d);
}
/* https://github.com/vuetifyjs/vuetify/issues/3462 */
.fab-button-icon-fix {
  display: inline-flex !important;
}
</style>
