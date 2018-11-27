<template>
  <div id="daemon-settings">
    <div class="setting-group">
      <v-layout row>
        <v-flex xs12 sm6 mr-3>
          <v-card>
            <v-toolbar>
              <v-toolbar-title>Factoid addresses</v-toolbar-title>

              <v-spacer></v-spacer>

              <v-toolbar-items class="hidden-sm-and-down">
                <v-btn flat>Generate</v-btn>
                <v-btn flat>Import</v-btn>
              </v-toolbar-items>
            </v-toolbar>

            <v-list>
              <template v-for="(item, index) in fctAddresses">
                <v-list-tile :key="item">
                  <v-list-tile-content>
                    <v-list-tile-title v-html="item"></v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
                <v-divider :key="index" v-if="index !== fctAddresses.length - 1"></v-divider>
              </template>
            </v-list>
          </v-card>
        </v-flex>
        <v-flex xs12 sm6 ml-3>
          <v-card>
            <v-toolbar>
              <v-toolbar-title>Entry Credit addresses</v-toolbar-title>

              <v-spacer></v-spacer>

              <v-toolbar-items class="hidden-sm-and-down">
                <v-btn flat>Generate</v-btn>
                <v-btn flat>Import</v-btn>
              </v-toolbar-items>
            </v-toolbar>

            <v-list>
              <template v-for="(item, index) in ecAddresses">
                <v-list-tile :key="item">
                  <v-list-tile-content>
                    <v-list-tile-title v-html="item"></v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
                <v-divider :key="index" v-if="index !== ecAddresses.length - 1"></v-divider>
              </template>
            </v-list>
          </v-card>
        </v-flex>
      </v-layout>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "AddressSettings",
  computed: {
    ...mapState(["ecAddresses", "fctAddresses"])
  }
};
</script>


<style scoped>
</style>
