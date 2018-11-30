<template>
  <div id="daemon-settings">
    <v-container grid-list-xl>
      <v-layout row wrap>
        <v-flex xs12 sm6>
          <v-card>
            <v-toolbar>
              <v-toolbar-title>Factoid addresses</v-toolbar-title>

              <v-spacer></v-spacer>

              <v-toolbar-items>
                <v-btn flat :disabled="!walletdOk" @click="generateAddress('factoid')">Generate</v-btn>
                <v-btn flat :disabled="!walletdOk">Import</v-btn>
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
        <v-flex xs12 sm6>
          <v-card>
            <v-toolbar>
              <v-toolbar-title>Entry Credit addresses</v-toolbar-title>

              <v-spacer></v-spacer>

              <v-toolbar-items class="hidden-sm-and-down">
                <v-btn flat :disabled="!walletdOk" @click="generateAddress('ec')">Generate</v-btn>
                <v-btn flat :disabled="!walletdOk">Import</v-btn>
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
    </v-container>
    <v-snackbar v-model="snackError" color="error" :timeout="5000">
      {{ snackErrorMessage }}
      <v-btn dark flat @click="snackError = false">Close</v-btn>
    </v-snackbar>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "AddressSettings",
  data: function() {
    return {
      snackError: false,
      snackErrorMessage: ""
    };
  },
  computed: {
    ...mapState({
      ecAddresses: state => state.walletd.ecAddresses,
      fctAddresses: state => state.walletd.fctAddresses
    }),
    walletdOk() {
      return this.$store.state.walletd.status === "ok";
    }
  },
  methods: {
    async generateAddress(type) {
      const cli = this.$store.getters["walletd/cli"];
      try {
        await cli.call(`generate-${type}-address`);
        this.$store.dispatch("walletd/fetchData");
      } catch (e) {
        this.snackErrorMessage = e.message;
        this.snackError = true;
      }
    }
  }
};
</script>


<style scoped>
</style>
