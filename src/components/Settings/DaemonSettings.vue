<template>
  <v-sheet elevation="1">
    <v-container>
      <v-layout wrap>
        <v-flex xs12>
          <div>
            <h2>
              Factom Daemon
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
            <h2>
              FAT Daemon
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
        </v-flex>
        <v-flex xs12 text-xs-center>
          <v-btn class="primary" @click="resetEndpoints">Reset to default endpoints</v-btn>
        </v-flex>
        <v-flex xs12 text-xs-center>
          <v-btn class="primary" @click="setLocalHostEndpoints">DEV: localhost</v-btn>
        </v-flex>
      </v-layout>
    </v-container>
  </v-sheet>
</template>

<script>
import debounce from 'lodash.debounce';
import DaemonStatus from './DaemonSettings/DaemonStatus.vue';
import { mapState } from 'vuex';
import { URL } from 'url';

export default {
  name: 'DaemonSettings',
  components: { DaemonStatus },
  data: function() {
    return {
      urlRules: [v => isValidUrl(v) || 'Invalid URL scheme']
    };
  },
  created: function() {
    this.debouncedUpdateFatd = debounce(this.$store.dispatch.bind(this, 'fatd/update'), 600);
    this.debouncedUpdateFactomd = debounce(this.$store.dispatch.bind(this, 'factomd/update'), 600);
  },
  computed: {
    ...mapState({
      fatdStatus: state => state.fatd.status,
      fatdVersion: state => state.fatd.version,
      fatdSyncHeight: state => state.fatd.syncHeight,
      fatdFactomHeight: state => state.fatd.factomHeight,
      factomdStatus: state => state.factomd.status,
      factomdVersion: state => state.factomd.version
    }),
    fatdSynced() {
      return this.$store.getters['fatd/synced'];
    },
    fatdEndpoint: {
      get() {
        return this.$store.state.fatd.endpoint;
      },
      set(value) {
        this.debouncedUpdateFatd(value);
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
  },
  methods: {
    resetEndpoints() {
      this.$store.dispatch('fatd/update', 'http://0.testnet.fat.dbgrow.com:8078');
      this.$store.dispatch('factomd/update', 'https://dev.factomd.net/v2');
    },
    setLocalHostEndpoints() {
      this.$store.dispatch('fatd/update', 'http://localhost:8078');
      this.$store.dispatch('factomd/update', 'http://localhost:8088/v2');
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

<style scoped></style>
