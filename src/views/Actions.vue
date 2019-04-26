<template>
  <v-container>
    <v-sheet elevation="2">
      <v-container>
        <v-layout wrap>
          <v-flex xs12 sm6 offset-sm3 my-4>
            <v-btn color="primary" large block :to="{ name: 'TrackToken' }" class="subheading">
              <v-icon left>track_changes</v-icon>Track an existing token
            </v-btn>
          </v-flex>
          <v-flex xs12 sm6 offset-sm3 my-4>
            <v-btn color="primary" large block :to="{ name: 'IssueToken' }" class="subheading" disabled>
              <v-icon left>create</v-icon>Issue a new token
            </v-btn>
          </v-flex>
          <v-flex xs12 sm6 offset-sm3 my-4>
            <v-btn color="primary" large block :to="{ name: 'CoinbaseTransaction' }" class="subheading" disabled>
              <v-icon left>send</v-icon>Create a coinbase transaction
            </v-btn>
          </v-flex>
        </v-layout>
      </v-container>
    </v-sheet>
  </v-container>
</template>

<script>
export default {};
</script>

<style scoped></style>
