<template>
  <v-layout>
    <v-flex xs12>
      <v-card>
        <v-card-text>
          <div>
            <h2>Factom Daemon
              <DaemonStatus :status="factomdStatus"></DaemonStatus>
            </h2>
            <v-container>
              <v-layout row wrap>
                <v-flex xs12 sm10>
                  <v-text-field label="Host" v-model.trim="factomdHost"></v-text-field>
                </v-flex>
                <v-flex xs12 sm2>
                  <v-text-field label="Port" type="number" v-model="factomdPort"></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </div>
          <div>
            <h2>FAT Daemon
              <DaemonStatus :status="fatdStatus"></DaemonStatus>
            </h2>
            <v-container>
              <v-layout row wrap>
                <v-flex xs12 sm10>
                  <v-text-field label="Host" v-model.trim="fatdHost"></v-text-field>
                </v-flex>
                <v-flex xs12 sm2>
                  <v-text-field label="Port" type="number" v-model="fatdPort"></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </div>
          <div>
            <h2>Wallet Daemon
              <DaemonStatus :status="walletdStatus"></DaemonStatus>
            </h2>
            <v-container>
              <v-layout row wrap>
                <v-flex xs12 sm10>
                  <v-text-field label="Host" v-model.trim="walletdHost"></v-text-field>
                </v-flex>
                <v-flex xs12 sm2>
                  <v-text-field label="Port" type="number" v-model="walletdPort"></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </div>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import debounce from "lodash.debounce";
import DaemonStatus from "@/components/settings/DaemonStatus.vue";
import { mapState } from "vuex";

export default {
  name: "DaemonSettings",
  components: { DaemonStatus },
  data: function() {
    return {};
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
      fatdStatus: state => state.fatd.status,
      factomdStatus: state => state.factomd.status
    }),
    fatdHost: {
      get() {
        return this.$store.state.fatd.config.host;
      },
      set(value) {
        this.debouncedUpdateFatd({ host: value, port: this.fatdPort });
      }
    },
    fatdPort: {
      get() {
        return this.$store.state.fatd.config.port;
      },
      set(value) {
        this.debouncedUpdateFatd({ host: this.fatdHost, port: value });
      }
    },
    walletdHost: {
      get() {
        return this.$store.state.walletd.config.host;
      },
      set(value) {
        this.debouncedUpdateWalletd({ host: value, port: this.walletdPort });
      }
    },
    walletdPort: {
      get() {
        return this.$store.state.walletd.config.port;
      },
      set(value) {
        this.debouncedUpdateWalletd({ host: this.walletdHost, port: value });
      }
    },
    factomdHost: {
      get() {
        return this.$store.state.factomd.config.host;
      },
      set(value) {
        this.debouncedUpdateFactomd({ host: value, port: this.factomdPort });
      }
    },
    factomdPort: {
      get() {
        return this.$store.state.factomd.config.port;
      },
      set(value) {
        this.debouncedUpdateFactomd({ host: this.factomdHost, port: value });
      }
    }
  }
};
</script>


<style scoped>
</style>
