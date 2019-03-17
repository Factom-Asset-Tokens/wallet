<template>
  <v-sheet elevation="1">
    <v-container>
      <v-layout>
        <v-flex xs12>
          <div>
            <h2>Factom Daemon
              <DaemonStatus :status="factomdStatus" :version="factomdVersion"></DaemonStatus>
            </h2>
            <v-container>
              <v-layout wrap>
                <v-flex xs12>
                  <v-text-field label="Endpoint" v-model.trim="factomdEndpoint" :rules="urlRules"></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </div>
          <div>
            <h2>FAT Daemon
              <DaemonStatus
                :status="fatdStatus"
                :version="fatdVersion"
                :syncing="!fatdSynced"
                :syncHeight="fatdSyncHeight"
                :targetHeight="fatdFactomHeight"
              ></DaemonStatus>
            </h2>
            <v-container>
              <v-layout wrap>
                <v-flex xs12>
                  <v-text-field label="Endpoint" v-model.trim="fatdEndpoint" :rules="urlRules"></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </div>
          <div>
            <h2>Wallet Daemon
              <DaemonStatus :status="walletdStatus" :version="walletdVersion"></DaemonStatus>
            </h2>
            <v-container>
              <v-layout row wrap>
                <v-flex xs12>
                  <v-text-field label="Endpoint" v-model.trim="walletdEndpoint" :rules="urlRules"></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </div>
        </v-flex>
      </v-layout>
    </v-container>
  </v-sheet>
</template>

<script>
import debounce from "lodash.debounce";
import DaemonStatus from "./DaemonSettings/DaemonStatus.vue";
import { mapState } from "vuex";
import { URL } from "url";

export default {
  name: "DaemonSettings",
  components: { DaemonStatus },
  data: function() {
    return {
      urlRules: [v => isValidUrl(v) || "Invalid URL scheme"]
    };
  },
  created: function() {
    this.debouncedUpdateFatd = debounce(
      this.$store.dispatch.bind(this, "fatd/update"),
      600
    );
    this.debouncedUpdateWalletd = debounce(
      this.$store.dispatch.bind(this, "walletd/update"),
      600
    );
    this.debouncedUpdateFactomd = debounce(
      this.$store.dispatch.bind(this, "factomd/update"),
      600
    );
  },
  computed: {
    ...mapState({
      walletdStatus: state => state.walletd.status,
      walletdVersion: state => state.walletd.version,
      fatdStatus: state => state.fatd.status,
      fatdVersion: state => state.fatd.version,
      fatdSyncHeight: state => state.fatd.syncHeight,
      fatdFactomHeight: state => state.fatd.factomHeight,
      factomdStatus: state => state.factomd.status,
      factomdVersion: state => state.factomd.version
    }),
    fatdSynced() {
      return this.$store.getters["fatd/synced"];
    },
    fatdEndpoint: {
      get() {
        return this.$store.state.fatd.endpoint;
      },
      set(value) {
        this.debouncedUpdateFatd(value);
      }
    },
    walletdEndpoint: {
      get() {
        return this.$store.state.walletd.endpoint;
      },
      set(value) {
        this.debouncedUpdateWalletd(value);
      }
    },
    factomdEndpoint: {
      get() {
        return this.$store.state.factomd.endpoint;
      },
      set(value) {
        this.debouncedUpdateFactomd(value);
      }
    }
  }
};

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}
</script>


<style scoped>
</style>
