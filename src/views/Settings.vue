<template>
  <div id="settings">

      <div class="setting-group">
          <h2 class="setting-group-title">FAT Daemon</h2>
          <v-form>
            <v-container>
              <v-layout row wrap>
                <v-flex xs12 sm10>
                  <v-text-field label="Host" v-model="fatdHost"></v-text-field>
                </v-flex>
                <v-flex xs12 sm2>
                  <v-text-field label="Port" type="number" v-model="fatdPort"></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </v-form>
      </div>
      <div class="setting-group">
          <h2 class="setting-group-title">Wallet Daemon</h2>
          <v-form>
            <v-container>
              <v-layout row wrap>
                <v-flex xs12 sm10>
                  <v-text-field label="Host" v-model="walletdHost"></v-text-field>
                </v-flex>
                <v-flex xs12 sm2>
                  <v-text-field label="Port" type="number" v-model="walletdPort"></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </v-form>
      </div>
  </div>
</template>

<script>
export default {
  name: "Settings",
  computed: {
    fatdHost: {
      get() {
        return this.$store.state.settings.fatd.host;
      },
      set(value) {
        this.$store.commit("updateFatdHost", value);
      }
    },
    fatdPort: {
      get() {
        return this.$store.state.settings.fatd.port;
      },
      set(value) {
        this.$store.commit("updateFatdPort", value);
      }
    },
    walletdHost: {
      get() {
        return this.$store.state.settings.walletd.host;
      },
      set(value) {
        this.$store.commit("updateWalletdHost", value);
      }
    },
    walletdPort: {
      get() {
        return this.$store.state.settings.walletd.port;
      },
      set(value) {
        this.$store.commit("updateWalletdPort", value);
      }
    }
  }
};
</script>


<style scoped>
</style>
