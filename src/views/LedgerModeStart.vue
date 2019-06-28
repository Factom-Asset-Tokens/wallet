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
                  <v-list-tile-sub-title v-show="deviceConnected">{{ productName }}</v-list-tile-sub-title>
                </v-list-tile-content>

                <v-list-tile-action>
                  <v-icon v-show="unknownStatus" color="grey">help_outline</v-icon>
                  <v-icon v-show="deviceConnected" color="success">check_circle</v-icon>
                  <v-icon v-show="!deviceConnected && !unknownStatus" color="error">cancel</v-icon>
                </v-list-tile-action>
              </v-list-tile>

              <v-divider></v-divider>

              <!-- Factom App detection -->
              <v-list-tile>
                <v-list-tile-content>
                  <v-list-tile-title>Factom App launched on the device</v-list-tile-title>
                  <v-list-tile-sub-title v-show="deviceConnected">{{ factomAppConf }}</v-list-tile-sub-title>
                </v-list-tile-content>

                <v-list-tile-action>
                  <v-icon v-show="unknownStatus" color="grey">help_outline</v-icon>
                  <v-icon v-show="factomAppLaunched" color="success">check_circle</v-icon>
                  <v-icon v-show="!factomAppLaunched && !unknownStatus" color="error">cancel</v-icon>
                </v-list-tile-action>
              </v-list-tile>

              <v-divider></v-divider>

              <!-- Deviced unlocked (can be queried) -->
              <v-list-tile>
                <v-list-tile-content>
                  <v-list-tile-title>Deviced unlocked and ready</v-list-tile-title>
                </v-list-tile-content>

                <v-list-tile-action>
                  <v-icon v-show="unknownStatus" color="grey">help_outline</v-icon>
                  <v-icon v-show="ready" color="success">check_circle</v-icon>
                  <v-icon v-show="!ready && !unknownStatus" color="error">cancel</v-icon>
                </v-list-tile-action>
              </v-list-tile>
            </v-list>
          </v-flex>
          <v-flex v-show="!deviceConnected" xs12 md6 offset-md3 mt-4>
            <v-alert :value="!deviceConnected" icon="info" color="primary" outline
              >Trouble connecting your device?
              <a @click="openLedgerHelpPage">
                Open Ledger help instructions.
              </a>
            </v-alert>
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
import { shell } from 'electron';

import { LEDGER_STATUS } from '@/store/modules/ledger';

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export default {
  name: 'LedgerStart',
  data() {
    return {
      timeoutId: null,
      initializing: false,
      previousStatus: LEDGER_STATUS.UNKNOWN,
      latestStatus: LEDGER_STATUS.UNKNOWN,
      ledgerBeingAccessed: false,
      poll: true
    };
  },
  computed: {
    status() {
      // Small hack to smooth the UI and avoid flickering of the displayed state:
      // when exiting the Factom app the ledger status go to "disconnected" for few ms before reconnecting
      if (this.latestStatus === LEDGER_STATUS.DISCONNECTED && this.previousStatus > LEDGER_STATUS.DISCONNECTED) {
        return LEDGER_STATUS.DEVICE_CONNECTED;
      }
      return this.latestStatus;
    },
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
    openLedgerHelpPage() {
      shell.openExternal('https://support.ledger.com/hc/en-us/articles/115005165269-Fix-connection-issues');
    },
    async getLedgerStatus() {
      this.ledgerBeingAccessed = true;
      const status = await this.$store.dispatch('ledger/getStatus');
      this.ledgerBeingAccessed = false;
      this.previousStatus = this.latestStatus;
      this.latestStatus = status;
    },
    async initialize() {
      try {
        this.initializing = true;
        this.stopPollingLedgerStatus();
        // If the Ledger is being accessed at the same time for status
        // wait for a few ms to finish and avoid 'initLedgerMode' calls to collide
        if (this.ledgerBeingAccessed) {
          await sleep(300);
        }
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
      this.poll = false;
      this.timeoutId = null;
    },
    async pollLedgerStatus() {
      await this.getLedgerStatus();
      if (this.poll) {
        this.timeoutId = setTimeout(() => this.pollLedgerStatus(), 800);
      }
    }
  },
  async created() {
    this.pollLedgerStatus();
  },
  beforeDestroy() {
    this.stopPollingLedgerStatus();
  }
};
</script>

<style scoped>
a {
  text-decoration: underline;
  color: #cccccc;
}
</style>
