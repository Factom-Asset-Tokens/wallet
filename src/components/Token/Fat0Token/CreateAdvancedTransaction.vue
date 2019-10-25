<template>
  <div>
    <v-sheet class="elevation-1 vsheet-bottom-margin">
      <v-container id="transaction">
        <v-form v-model="validForm" ref="form" @submit.prevent="confirmTransaction" lazy-validation>
          <v-layout wrap>
            <!-- Inputs -->
            <v-flex xs12 pb-4>
              <v-toolbar flat color="primary">
                <v-toolbar-title><v-icon left>fa-sign-in-alt</v-icon>Inputs</v-toolbar-title>

                <v-spacer></v-spacer>
                <div class="total-amount">{{ totalInputs.toFormat() }} {{ symbol }}</div>
                <v-toolbar-items>
                  <v-btn flat @click="addInoutput('inputs')">
                    <v-icon>add_box</v-icon>
                  </v-btn>
                </v-toolbar-items>
              </v-toolbar>
            </v-flex>
            <v-flex xs12 v-for="(input, index) in inputs" :key="'input-' + input.id">
              <TransactionInput
                v-model="inputs[index]"
                @delete="deleteInoutput('inputs', input.id)"
                :balances="balances"
                :first="index === 0"
                :symbol="symbol"
                :alreadySelectedAddresses="selectedInputAddresses"
              ></TransactionInput>
            </v-flex>

            <!-- Outputs -->
            <v-flex xs12 pt-5 pb-4>
              <v-toolbar flat color="primary">
                <v-toolbar-title><v-icon left>fa-sign-out-alt</v-icon>Outputs</v-toolbar-title>

                <v-spacer></v-spacer>
                <div class="total-amount">{{ totalOutputs.toFormat() }} {{ symbol }}</div>
                <v-toolbar-items>
                  <v-btn flat @click="addInoutput('outputs')">
                    <v-icon>add_box</v-icon>
                  </v-btn>
                </v-toolbar-items>
              </v-toolbar>
            </v-flex>

            <v-flex xs12 v-for="(output, index) in outputs" :key="'output-' + output.id">
              <v-layout wrap align-baseline justify-center>
                <v-flex xs12 md8 pr-4>
                  <v-text-field
                    label="Address"
                    v-model.trim="output.address"
                    :rules="outputAddressRules"
                    size="50"
                    single-line
                    box
                    required
                  ></v-text-field>
                </v-flex>
                <v-flex xs11 md3>
                  <v-text-field
                    v-model="output.amount"
                    type="number"
                    :suffix="symbol"
                    :rules="outputAmountRules"
                    min="0"
                    label="Amount"
                    single-line
                    box
                    required
                  ></v-text-field>
                </v-flex>
                <v-flex xs1 text-xs-center>
                  <v-icon v-if="index !== 0" @click="deleteInoutput('outputs', output.id)">delete</v-icon>
                </v-flex>
              </v-layout>
            </v-flex>

            <!-- Send & alerts -->
            <v-layout align-center wrap>
              <v-flex xs12 sm9>
                <v-alert v-if="sendClicked" :value="!validTransaction" color="error" icon="warning" outline>
                  {{ transactionError }}
                </v-alert>
              </v-flex>

              <v-flex xs12 sm3 text-xs-right pt-3>
                <v-btn icon>
                  <v-icon title="Attach metadata" :color="metadataIconColor" @click="attachMetadata">more</v-icon>
                </v-btn>
                <v-btn color="primary" large :disabled="!validForm" type="submit" :loading="sending"
                  >Send
                  <v-icon right>send</v-icon>
                </v-btn>
              </v-flex>

              <!-- Alerts transaction success/failure-->
              <v-flex v-if="errorMessage" xs12>
                <v-alert :value="errorMessage" type="error" outline dismissible>{{ errorMessage }}</v-alert>
              </v-flex>
              <v-flex xs12>
                <v-alert :value="transactionSentMessage" type="success" outline dismissible>
                  {{ transactionSentMessage }}
                </v-alert>
              </v-flex>
            </v-layout>
          </v-layout>

          <!-- Dialogs -->
          <ConfirmTransactionDialog
            ref="confirmTransactionDialog"
            :symbol="symbol"
            @error="displayError"
            @confirmed="send"
          ></ConfirmTransactionDialog>
          <AttachMetadataDialog ref="attachMetadataDialog" @update:metadata="metadata = $event"> </AttachMetadataDialog>
          <LedgerSignEntryDialog ref="ledgerSignEntryDialog"></LedgerSignEntryDialog>
        </v-form>
      </v-container>
    </v-sheet>
    <AddressBook type="fct" @address="pickAddressFromAddressBook"></AddressBook>
  </div>
</template>

<script>
import TransactionBuilder from '@fat-token/fat-js/0/TransactionBuilder';
import { clipboard } from 'electron';
import Big from 'bignumber.js';
import Promise from 'bluebird';
import { isValidPublicFctAddress } from 'factom';
// Components
import SendFatTransaction from '@/mixins/SendFatTransaction';
import TransactionInput from './CreateAdvancedTransaction/TransactionInput';
import ConfirmTransactionDialog from './CreateAdvancedTransaction/ConfirmTransactionDialog';
import LedgerSignEntryDialog from '@/components/Token/LedgerSignEntryDialog';
import AddressBook from '@/components/AddressBook';
import AttachMetadataDialog from '@/components/Token/AttachMetadataDialog';

const newInoutput = (function() {
  let i = 0;
  return function() {
    return { id: i++, address: '', amount: '' };
  };
})();

const ZERO = new Big(0);

export default {
  components: { TransactionInput, ConfirmTransactionDialog, AddressBook, AttachMetadataDialog, LedgerSignEntryDialog },
  mixins: [SendFatTransaction],
  data() {
    return {
      sendClicked: false,
      validForm: true,
      validTransaction: true,
      transactionError: '',
      inputs: [],
      outputs: [],
      metadata: '',
      errorMessage: ''
    };
  },
  props: ['balances', 'symbol', 'tokenCli'],
  created() {
    this.addInoutput('inputs');
    this.addInoutput('outputs');
  },
  computed: {
    metadataIconColor() {
      return this.metadata ? 'secondary' : 'grey';
    },
    selectedInputAddresses() {
      return new Set(this.inputs.map(i => i.address));
    },
    outputAddressRules() {
      return [address => isValidPublicFctAddress(address) || 'Invalid public FCT address'];
    },
    outputAmountRules() {
      return [v => v >= 0 || 'Amount must be positive'];
    },
    totalInputs() {
      return this.inputs
        .map(o => o.amount)
        .filter(a => !!a)
        .reduce((acc, val) => acc.plus(val), ZERO);
    },

    totalOutputs() {
      return this.outputs
        .map(o => o.amount)
        .filter(a => !!a)
        .reduce((acc, val) => acc.plus(val), ZERO);
    },
    validTransactionProperties() {
      return [this.inputs, this.outputs];
    }
  },
  methods: {
    displayError(e) {
      this.errorMessage = e.message;
    },
    showLedgerSignEntryDialog() {
      this.$refs.ledgerSignEntryDialog.show();
    },
    closeLedgerSignEntryDialog() {
      this.$refs.ledgerSignEntryDialog.close();
    },
    pickAddressFromAddressBook(address) {
      clipboard.writeText(address);
      this.$store.commit('snackInfo', 'Address copied to the clipboard');
      const vuetify = this.$vuetify;
      this.$nextTick(() => vuetify.goTo('#transaction'));
    },
    addInoutput: function(type) {
      this[type].push(newInoutput());
    },
    deleteInoutput(type, id) {
      this[type] = this[type].filter(v => v.id !== id);
    },
    async confirmTransaction() {
      this.errorMessage = '';
      this.transactionSentMessage = '';

      if (this.$refs.form.validate()) {
        this.sendClicked = true;
        if (this.validTransaction) {
          this.sendClicked = false;
          try {
            const ledgerMode = this.$store.state.ledgerMode;
            const tx = await this.buildTransaction(ledgerMode);
            this.$refs.confirmTransactionDialog.show(tx, ledgerMode);
          } catch (e) {
            this.errorMessage = e.message;
          }
        }
      }
    },
    async send(tx) {
      await this.sendTransaction(tx);
      if (this.transactionSentMessage) {
        this.inputs = [newInoutput()];
        this.outputs = [newInoutput()];
        this.metadata = '';
      }
    },
    async buildTransaction(ledgerMode) {
      const txBuilder = new TransactionBuilder(this.tokenCli.getChainId());

      if (ledgerMode) {
        // Put public keus as input addresses
        for (const input of this.inputs) {
          txBuilder.input(input.address, input.amount);
        }
      } else {
        // Get inputs secret keys from on-disk keystore
        const keystore = this.$store.state.keystore.store;
        const inputsSecrets = await Promise.map(this.inputs, async function(input) {
          const secret = keystore.getSecretKey(input.address);
          return { secret, amount: input.amount };
        });

        for (const input of inputsSecrets) {
          txBuilder.input(input.secret, input.amount);
        }
      }

      for (const output of this.outputs) {
        txBuilder.output(output.address, output.amount);
      }

      if (this.metadata) {
        txBuilder.metadata(this.metadata);
      }

      return txBuilder.build();
    },
    attachMetadata() {
      this.$refs.attachMetadataDialog.show(this.metadata);
    }
  },
  watch: {
    validTransactionProperties: {
      deep: true,
      handler() {
        // Check duplicate among inputs
        const inputAddresses = this.inputs.map(i => i.address);
        const duplicateInputs = inputAddresses.filter((v, i) => inputAddresses.indexOf(v) !== i);
        if (duplicateInputs.length > 0) {
          this.validTransaction = false;
          this.transactionError = `${duplicateInputs[0]} is used multiple times in inputs.`;
          return;
        }
        // Check duplicate among outputs
        const outputAddresses = this.outputs.map(i => i.address);
        const duplicateOutputs = outputAddresses.filter((v, i) => outputAddresses.indexOf(v) !== i);
        if (duplicateOutputs.length > 0) {
          this.validTransaction = false;
          this.transactionError = `${duplicateOutputs[0]} is used multiple times in outputs.`;
          return;
        }

        // Total inputs and outputs must be equal
        if (!this.totalInputs.eq(this.totalOutputs)) {
          this.validTransaction = false;
          this.transactionError = 'The sum of inputs and outputs must be equal.';
          return;
        }

        this.validTransaction = true;
        this.transactionError = '';
      }
    }
  }
};
</script>

<style scoped>
.total-amount {
  margin-right: 36px;
}
.vsheet-bottom-margin {
  margin-bottom: 24px;
}
</style>
