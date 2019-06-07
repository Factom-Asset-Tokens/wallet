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
            <v-layout wrap my-4>
              <v-flex xs11>
                <v-text-field
                  label="Endpoint"
                  v-model.trim="factomdEndpoint"
                  :error-messages="factomdErrorMessage"
                  single-line
                  box
                ></v-text-field>
              </v-flex>
              <v-flex xs1 text-xs-center>
                <v-menu offset-y bottom left>
                  <template v-slot:activator="{ on }">
                    <v-btn icon v-on="on"><v-icon>keyboard_arrow_down</v-icon></v-btn>
                  </template>
                  <v-list dense subheader>
                    <v-subheader>Suggested endpoints</v-subheader>
                    <v-list-tile
                      v-for="item in factomdEndpointList"
                      :key="item.endpoint"
                      @click="setFactomdEndpoint(item.endpoint)"
                    >
                      <v-list-tile-title>{{ item.name }}</v-list-tile-title>
                    </v-list-tile>
                  </v-list>
                </v-menu>
              </v-flex>
            </v-layout>
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
            <v-layout wrap mt-4>
              <v-flex xs11>
                <v-text-field
                  label="Endpoint"
                  v-model.trim="fatdEndpoint"
                  :error-messages="fatdErrorMessage"
                  single-line
                  box
                >
                </v-text-field>
              </v-flex>
              <v-flex xs1 text-xs-center>
                <v-menu offset-y bottom left>
                  <template v-slot:activator="{ on }">
                    <v-btn icon large v-on="on"><v-icon>keyboard_arrow_down</v-icon></v-btn>
                  </template>
                  <v-list dense subheader>
                    <v-subheader>Suggested endpoints</v-subheader>
                    <v-list-tile
                      v-for="item in fatdEndpointList"
                      :key="item.endpoint"
                      @click="setFatdEndpoint(item.endpoint)"
                    >
                      <v-list-tile-title>{{ item.name }}</v-list-tile-title>
                    </v-list-tile>
                  </v-list>
                </v-menu>
              </v-flex>
            </v-layout>
          </div>
        </v-flex>
      </v-layout>
    </v-container>
  </v-sheet>
</template>

<script>
import debounce from 'lodash.debounce';
import DaemonStatus from './DaemonSettings/DaemonStatus.vue';
import { mapState } from 'vuex';
import escape from 'escape-html';

export default {
  name: 'DaemonSettings',
  components: { DaemonStatus },
  data() {
    return {
      factomdEndpointList: [
        { name: 'Open Node Network (testnet)', endpoint: 'https://dev.factomd.net/v2' },
        { name: 'Localhost', endpoint: 'http://localhost:8088/v2' }
      ],
      fatdEndpointList: [
        { name: 'DBGrow Courtesy node (testnet)', endpoint: 'http://0.testnet.fat.dbgrow.com:8078' },
        { name: 'Localhost', endpoint: 'http://localhost:8078' }
      ]
    };
  },
  created: function() {
    this.debouncedUpdateFatd = debounce(this.$store.dispatch.bind(this, 'fatd/update'), 600);
    this.debouncedUpdateFactomd = debounce(this.$store.dispatch.bind(this, 'factomd/update'), 600);
    Promise.all([this.$store.dispatch('factomd/checkStatus'), this.$store.dispatch('fatd/checkStatus')]).catch(
      () => {}
    );
  },
  computed: {
    ...mapState({
      fatdStatus: state => state.fatd.status,
      fatdErrorMessage: state => (state.fatd.errorMessage ? [escape(state.fatd.errorMessage)] : []),
      fatdVersion: state => state.fatd.version,
      fatdSyncHeight: state => state.fatd.syncHeight,
      fatdFactomHeight: state => state.fatd.factomHeight,
      factomdStatus: state => state.factomd.status,
      factomdErrorMessage: state => (state.factomd.errorMessage ? [escape(state.factomd.errorMessage)] : []),
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
    setFactomdEndpoint(endpoint) {
      this.$store.dispatch('factomd/update', endpoint);
    },
    setFatdEndpoint(endpoint) {
      this.$store.dispatch('fatd/update', endpoint);
    }
  }
};
</script>

<style scoped></style>
