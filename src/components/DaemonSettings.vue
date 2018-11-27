<template>
  <div id="daemon-settings">
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
        <DaemonStatus :status="walletdStatus"></DaemonStatus>
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
import { mapState } from "vuex";

export default {
  name: "DaemonSettings",
  components: { DaemonStatus },
  data: function() {
    return {
      fatdHealth: null
    };
  },
  watch: {
    fatdHost: function() {
      this.debouncedFatdHealthCheck();
    },
    fatdPort: function() {
      this.debouncedFatdHealthCheck();
    }
  },
  created: function() {
    this.debouncedFatdHealthCheck = debounce(this.fatdHealthCheck, 600);
    this.debouncedUpdateWalletd = debounce(
      this.$store.dispatch.bind(this, "updateWalletd"),
      600
    );
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
        .catch(function() {
          that.fatdHealth = "ko";
        });
    }
  },
  computed: {
    ...mapState(["walletdStatus"]),
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
        this.debouncedUpdateWalletd({
          host: value,
          port: this.walletdPort
        });
      }
    },
    walletdPort: {
      get() {
        return this.$store.state.settings.walletd.port;
      },
      set(value) {
        this.debouncedUpdateWalletd({
          host: this.walletdHost,
          port: value
        });
      }
    }
  },
  mounted() {
    this.fatdHealthCheck();
  }
};
</script>


<style scoped>
</style>
