<template>
  <div id="settings">
    <div class="setting-group">
      <h2 class="setting-group-title">FAT Daemon
        <DaemonStatus :status="fatdHealth"></DaemonStatus>
      </h2>
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
      <h2 class="setting-group-title">Wallet Daemon
        <DaemonStatus :status="walletdHealth"></DaemonStatus>
      </h2>
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
import debounce from "lodash.debounce";
// TODO: replace by fatd-js client
import axios from "axios";
import DaemonStatus from "@/components/DaemonStatus.vue";

export default {
  name: "DaemonSettings",
  components: { DaemonStatus },
  data: function() {
    return {
      fatdHealth: null,
      walletdHealth: null
    };
  },
  watch: {
    fatdHost: function() {
      this.debouncedFatdHealthCheck();
    },
    fatdPort: function() {
      this.debouncedFatdHealthCheck();
    },
    walletdHost: function() {
      this.debouncedWalletdHealthCheck();
    },
    walletdPort: function() {
      this.debouncedWalletdHealthCheck();
    }
  },
  created: function() {
    this.debouncedFatdHealthCheck = debounce(this.fatdHealthCheck, 600);
    this.debouncedWalletdHealthCheck = debounce(this.walletdHealthCheck, 600);
  },
  methods: {
    fatdHealthCheck: function() {
      this.fatdHealth = null;
      const that = this;
      axios
        .post(`http://${this.fatdHost}:${this.fatdPort}/v0`, {
          jsonrpc: "2.0",
          method: "get-stats",
          params: {
            "chain-id":
              "8eaed885426782315ac89e8c3688a539af6d2c1d5ee27372802e931877b8d325"
          },
          id: "5"
        })
        .then(function() {
          that.fatdHealth = "ok";
        })
        .catch(function(error) {
          that.fatdHealth = "ko";
        });
    },
    walletdHealthCheck: async function() {
      this.walletdHealth = null;

      const cli = this.$store.getters.walletdCli;
      const that = this;
      cli
        .call("properties")
        .then(() => (that.walletdHealth = "ok"))
        .catch(() => (that.walletdHealth = "ko"));
    }
  },
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
  },
  mounted() {
    this.fatdHealthCheck();
    this.walletdHealthCheck();
  }
};
</script>


<style scoped>
</style>
