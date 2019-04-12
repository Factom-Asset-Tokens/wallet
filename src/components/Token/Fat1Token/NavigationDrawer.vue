<template>
  <v-navigation-drawer dark permanent app floating right>
    <v-container>
      <v-flex text-xs-center class="title">
        {{ tokenId }}
      </v-flex>
    </v-container>
    <v-list subheader>
      <v-divider></v-divider>

      <v-subheader class="primary--text">Info</v-subheader>
      <v-list-tile
        avatar
        to="?view=balances"
        exact
        color="secondary"
        exact-active-class="secondary--text active-nav-element"
      >
        <v-list-tile-action>
          <v-icon color="secondary">account_balance_wallet</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title class="subheading">Balances</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile
        avatar
        to="?view=history"
        exact
        color="secondary"
        exact-active-class="secondary--text active-nav-element"
      >
        <v-list-tile-action>
          <v-icon color="secondary">history</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title class="subheading">Transaction History</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
    <v-divider inset></v-divider>

    <v-list subheader>
      <v-subheader class="primary--text">Actions</v-subheader>

      <v-list-tile
        avatar
        to="?view=send"
        exact
        color="secondary"
        exact-active-class="secondary--text active-nav-element"
      >
        <v-list-tile-action>
          <v-icon color="secondary">send</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title class="subheading">Send Tokens</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  props: ['tokenId']
};
</script>
