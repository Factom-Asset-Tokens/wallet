<template>
  <v-layout>
    <v-flex v-show="ready">
      <v-list-tile>
        <v-list-tile-action> <v-icon color="success">check_circle</v-icon> </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title class="lighterGrey--text">
            Ledger ready to sign transaction.
          </v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>

      <v-list-tile v-for="(step, index) in signingSteps" :key="index">
        <v-list-tile-action v-if="step"> <v-icon color="success">check_circle</v-icon> </v-list-tile-action>
        <v-list-tile-action v-else> <v-icon>help_outline</v-icon> </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title v-if="step" class="lighterGrey--text">
            Transaction signed for input #{{ index + 1 }}.
          </v-list-tile-title>
          <v-list-tile-title v-else>
            Confirm signature for input #{{ index + 1 }} on your Ledger device.
          </v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-flex>
    <v-flex v-show="!ready">
      <v-list>
        <v-list-tile>
          <v-list-tile-action>
            <v-icon color="error">cancel</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>
              Unlock your Ledger device and launch the Factom app to start signing the transaction.
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-flex>
  </v-layout>
</template>

<script>
import { LEDGER_STATUS } from '@/store/modules/ledger';

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export default {
  props: ['transaction'],
  data() {
    return {
      active: false,
      ledgerStatus: LEDGER_STATUS.UNKNOWN,
      signatures: []
    };
  },
  computed: {
    signingSteps() {
      const steps = Array(this.signatures.length).fill(true);

      if (!this.signatureCompleted) {
        steps.push(false);
      }

      return steps;
    },
    ready() {
      return this.ledgerStatus >= LEDGER_STATUS.UNLOCKED;
    }
  },
  methods: {
    async waitForLedgerReady() {
      while (this.active && this.ledgerStatus < LEDGER_STATUS.UNLOCKED) {
        this.ledgerStatus = await this.$store.dispatch('ledger/getStatus');
        await sleep(1000);
      }

      if (this.active && this.ledgerStatus === LEDGER_STATUS.UNLOCKED) {
        this.requestNextSignature();
      }
    },
    async activate() {
      this.signatures = [];
      this.ledgerStatus = LEDGER_STATUS.UNKNOWN;
      this.active = true;
      this.waitForLedgerReady();
    },
    deactivate() {
      this.active = false;
    },
    async requestNextSignature() {
      try {
        const signature = await this.signTransactionForNextInput();
        this.signatures.push(signature);

        // If the confirmation dialog was closed while waiting for the user
        // to confirm the tx on the Ledger it should abort the process here.
        if (!this.active) {
          return;
        }

        if (this.signatureCompleted) {
          this.emitSignedTransaction();
        } else {
          this.requestNextSignature();
        }
      } catch (e) {
        this.$emit('error', e);
      }
    },
    emitSignedTransaction() {
      try {
        const signedTx = this.buildSignedTransaction();
        this.$emit('signedTx', signedTx);
      } catch (e) {
        this.$emit('error', e);
      }
    }
  }
};
</script>

<style></style>
