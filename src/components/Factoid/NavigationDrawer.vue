<template>
  <v-navigation-drawer dark permanent app floating right>
    <v-container>
      <v-flex text-xs-center class="subheading">
        FCT & EC
      </v-flex>
    </v-container>
    <v-list subheader>
      <v-subheader class="primary--text">Info</v-subheader>
      <v-list-tile avatar @click="$emit('show', 'addresses')">
        <v-list-tile-action>
          <v-icon color="secondary">account_balance_wallet</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title class="secondary--text subheading">Addresses & Balances</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile avatar @click="$emit('show', 'history')">
        <v-list-tile-action>
          <v-icon color="secondary">history</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title class="secondary--text subheading">Transaction History</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
    <v-divider inset></v-divider>

    <v-list subheader>
      <v-subheader class="primary--text">Actions</v-subheader>

      <v-list-tile avatar @click="$emit('show', 'send')">
        <v-list-tile-action>
          <v-icon color="secondary">send</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title class="secondary--text subheading">Send Factoids</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>

      <v-list-tile avatar @click="$emit('show', 'convert')">
        <v-list-tile-action>
          <v-icon color="secondary">local_play</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title class="secondary--text subheading">Convert FCT to Entry Credit</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
  </v-navigation-drawer>
</template>
