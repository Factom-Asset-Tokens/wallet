<template>
  <v-container>
    <v-sheet elevation="2">
      <v-container>
        <v-layout wrap>
          <v-flex xs12 my-4 text-xs-center class="secondary--text">
            <div class="display-1 font-weight-light">Ledger Mode</div>
          </v-flex>
          <v-flex xs12 text-xs-center mt-3>
            <blockquote class="blockquote">
              <p>
                Connect your Ledger Nano device to your computer and launch the Factom app on it to continue.
              </p>
            </blockquote>
          </v-flex>
          <v-flex xs12 sm6 offset-sm3 mt-4>
            <v-list two-line>
              <!-- Device detection -->
              <v-list-tile color="lightGrey">
                <v-list-tile-content>
                  <v-list-tile-title>Ledger device connected</v-list-tile-title>
                  <v-list-tile-sub-title>{{ productName }}</v-list-tile-sub-title>
                </v-list-tile-content>

                <v-list-tile-action>
                  <v-icon v-if="unknownStatus" color="grey">help_outline</v-icon>
                  <v-icon v-else-if="deviceConnected" color="success">check_circle</v-icon>
                  <v-icon v-else color="error">cancel</v-icon>
                </v-list-tile-action>
              </v-list-tile>

              <v-divider></v-divider>

              <!-- Factom App detection -->
              <v-list-tile>
                <v-list-tile-content>
                  <v-list-tile-title>Factom App launched on the device</v-list-tile-title>
                  <v-list-tile-sub-title>{{ factomAppConf }}</v-list-tile-sub-title>
                </v-list-tile-content>

                <v-list-tile-action>
                  <v-icon v-if="unknownStatus" color="grey">help_outline</v-icon>
                  <v-icon v-else-if="factomAppLaunched" color="success">check_circle</v-icon>
                  <v-icon v-else color="error">cancel</v-icon>
                </v-list-tile-action>
              </v-list-tile>

              <v-divider></v-divider>

              <!-- Deviced unlocked (can be queried) -->
              <v-list-tile>
                <v-list-tile-content>
                  <v-list-tile-title>Deviced unlocked and ready</v-list-tile-title>
                </v-list-tile-content>

                <v-list-tile-action>
                  <v-icon v-if="unknownStatus" color="grey">help_outline</v-icon>
                  <v-icon v-else-if="ready" color="success">check_circle</v-icon>
                  <v-icon v-else color="error">cancel</v-icon>
                </v-list-tile-action>
              </v-list-tile>
            </v-list>
          </v-flex>
          <v-flex xs12 text-xs-center mt-5>
            <v-btn color="primary" @click="initialize" :disabled="!ready">Start Ledger Mode</v-btn>
          </v-flex>
        </v-layout>
      </v-container>
    </v-sheet>
    <v-dialog v-model="initializing" persistent width="300">
      <v-card color="primary">
        <v-card-text>
          Initializing the wallet with your Ledger...
          <v-progress-linear indeterminate color="white"></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { LEDGER_STATUS } from '@/store/modules/ledger';

export default {
  name: 'LedgerStart',
  data() {
    return {
      timeoutId: null,
      initializing: false,
      status: LEDGER_STATUS.UNKNOWN
    };
  },
  computed: {
    productName() {
      return this.$store.state.ledger.productName;
    },
    factomAppConf() {
      return this.$store.state.ledger.factomAppConf;
    },
    unknownStatus() {
      return this.status === LEDGER_STATUS.UNKNOWN;
    },
    deviceConnected() {
      return this.status >= LEDGER_STATUS.DEVICE_CONNECTED;
    },
    factomAppLaunched() {
      return this.status >= LEDGER_STATUS.FCT_APP_LAUNCHED;
    },
    ready() {
      return this.status >= LEDGER_STATUS.UNLOCKED;
    }
  },
  methods: {
    async getLedgerStatus() {
      this.status = await this.$store.dispatch('ledger/getStatus');
    },
    async initialize() {
      try {
        this.initializing = true;
        this.stopPollingLedgerStatus();
        await this.$store.dispatch('initLedgerMode');
        this.$router.replace({ name: 'Factoid', query: { view: 'addresses' } });
        this.$store.commit('showAppSideBar');
      } catch (e) {
        this.pollLedgerStatus();
        this.$store.commit('snackError', e.message);
      } finally {
        this.initializing = false;
      }
    },
    stopPollingLedgerStatus() {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    },
    async pollLedgerStatus() {
      await this.getLedgerStatus();
      this.timeoutId = setTimeout(() => this.pollLedgerStatus(), 800);
    }
  },
  async created() {
    await this.$store.dispatch('ledger/init');
    this.pollLedgerStatus();
  },
  beforeDestroy() {
    this.stopPollingLedgerStatus();
  }
};
</script>

<style scoped></style>
