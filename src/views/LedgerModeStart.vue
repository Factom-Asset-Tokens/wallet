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
                  <v-icon v-if="deviceOk" color="success">check_circle</v-icon>
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
                  <v-icon v-if="factomAppOk" color="success">check_circle</v-icon>
                  <v-icon v-else color="error">cancel</v-icon>
                </v-list-tile-action>
              </v-list-tile>
            </v-list>
          </v-flex>
          <v-flex xs12 text-xs-center mt-5>
            <v-btn @click="testLock" color="primary" :disabled="!ledgerModeOk">Start Ledger Mode</v-btn>
          </v-flex>
        </v-layout>
      </v-container>
    </v-sheet>
  </v-container>
</template>

<script>
import 'babel-polyfill';
import Transport from '@ledgerhq/hw-transport-node-hid';
import Fct from '@factoid.org/hw-app-fct';

export default {
  name: 'LedgerStart',
  data() {
    return {
      transport: null,
      factomAppConf: null,
      fctApp: null
    };
  },
  computed: {
    productName() {
      return this.transport ? this.transport.deviceModel.productName : '';
    },
    deviceOk() {
      return !!this.transport;
    },
    factomAppOk() {
      return !!this.factomAppConf;
    },
    ledgerModeOk() {
      return this.deviceOk && this.factomAppOk;
    }
  },
  methods: {
    async handleConnection(descriptor) {
      try {
        console.log('Connecting...');

        this.transport = await Transport.open(descriptor);
        console.log('Connected');

        try {
          this.fctApp = new Fct(this.transport);
          this.factomAppConf = await this.fctApp.getAppConfiguration();
          console.log('Factom App OK');
        } catch (e) {
          this.factomAppConf = null;
        }
      } catch (e) {
        this.transport = null;
        this.factomAppConf = null;
      }
    },
    async testLock() {
      try {
        const address = await this.fctApp.getAddress(`44'/131'/0'/0'/0'`);
        console.log(address);
      } catch (e) {
        console.log('Error testLock:', e);
      }
    }
  },
  async created() {
    Transport.listen({
      next: async e => {
        if (e.type === 'add') {
          this.handleConnection(e.descriptor);
        } else if (e.type === 'remove') {
          this.transport = null;
          this.factomAppConf = null;
        } else {
          throw e;
        }
      },
      error: error => {
        throw error;
      }
    });
  }
};
</script>

<style scoped></style>
