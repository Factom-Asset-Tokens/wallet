<template>
  <div>
    <v-sheet class="elevation-1 vsheet-bottom-margin">
      <v-container id="transaction">
        <v-form v-model="validForm" ref="form" @submit.prevent="sendTransactionForConfirmation" lazy-validation>
          <v-layout wrap>
            <!-- Inputs -->
            <v-flex xs12 pb-4>
              <v-toolbar flat color="primary">
                <v-toolbar-title><v-icon left>fa-sign-in-alt</v-icon>Inputs</v-toolbar-title>

                <v-spacer></v-spacer>
                <div class="total-amount">{{ totalInputs.toFormat() }} FCT</div>
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
                :alreadySelectedAddresses="selectedInputAddresses"
              ></TransactionInput>
            </v-flex>

            <!-- Outputs -->
            <v-flex xs12 pt-5 pb-4>
              <v-toolbar flat color="primary">
                <v-toolbar-title><v-icon left>fa-sign-out-alt</v-icon>Outputs</v-toolbar-title>

                <v-spacer></v-spacer>
                <div class="total-amount">{{ totalOutputs.toFormat() }} FCT</div>
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
                    suffix="FCT"
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

            <!-- Fee indicators -->
            <v-flex xs12 v-show="showFeeIndicators">
              <FeeIndicators :transactionFee="transactionFee" :requiredFee="requiredFee"></FeeIndicators>
            </v-flex>

            <v-layout align-center wrap>
              <!-- Transaction building error -->
              <v-flex xs12 sm10>
                <v-alert :value="!validTransaction" color="error" icon="warning" outline>
                  {{ transactionError }}
                </v-alert>
              </v-flex>

              <!-- Send button -->
              <v-flex xs12 sm2 text-xs-right pt-3>
                <v-btn color="primary" large :disabled="!validForm || !validFees" type="submit" :loading="sending">
                  Send
                  <v-icon right>send</v-icon>
                </v-btn>
              </v-flex>

              <!-- Alerts transaction success/failure-->
              <v-flex v-show="errorMessage" xs12>
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
          <ConfirmTransactionDialog ref="confirmTransactionDialog" @confirmed="send"></ConfirmTransactionDialog>
          <LedgerConfirmTransactionDialog
            ref="ledgerConfirmTransactionDialog"
            @confirmed="send"
            @error="displayError"
          ></LedgerConfirmTransactionDialog>
        </v-form>
      </v-container>
    </v-sheet>
    <AddressBook type="fct" @address="pickAddressFromAddressBook"></AddressBook>
  </div>
</template>

<script>
import { clipboard } from 'electron';
import Big from 'bignumber.js';
import NodeCache from 'node-cache';
import { isValidPublicFctAddress } from 'factom';
import { computeRequiredFees, buildTransaction } from './TransactionHelper';
// Components
import TransactionInput from './CreateAdvancedTransaction/TransactionInput';
import ConfirmTransactionDialog from './CreateAdvancedTransaction/ConfirmTransactionDialog';
import LedgerConfirmTransactionDialog from './CreateAdvancedTransaction/LedgerConfirmTransactionDialog';
import FeeIndicators from './CreateAdvancedTransaction/FeeIndicators';
import AddressBook from '@/components/AddressBook';

const newInoutput = (function() {
  let i = 0;
  return function() {
    return { id: i++, address: '', amount: '' };
  };
})();

const ZERO = new Big(0);
const FACTOSHI_MULTIPLIER = new Big(100000000);

export default {
  components: {
    TransactionInput,
    FeeIndicators,
    ConfirmTransactionDialog,
    LedgerConfirmTransactionDialog,
    AddressBook
  },
  data() {
    return {
      validForm: true,
      validTransaction: true,
      transactionSentMessage: '',
      sending: false,
      transactionError: '',
      inputs: [],
      outputs: [],
      errorMessage: '',
      requiredFee: ZERO
    };
  },
  created() {
    this.cache = new NodeCache({ stdTTL: 60, checkperiod: 10 });
    this.addInoutput('inputs');
    this.addInoutput('outputs');
  },
  computed: {
    balances() {
      const balances = this.$store.state.address.fctBalances;
      return this.$store.getters['address/fctAddressesWithNames'].map(o => ({
        address: o.address,
        balance: balances[o.address] || new Big(0),
        name: o.name
      }));
    },
    selectedInputAddresses() {
      return new Set(this.inputs.map(i => i.address));
    },
    outputAddressRules() {
      return [address => isValidPublicFctAddress(address) || 'Invalid public FCT address'];
    },
    outputAmountRules() {
      return [v => v > 0 || 'Amount must be strictly positive'];
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
    showFeeIndicators() {
      return this.validTransaction && this.validForm && this.outputs.some(i => i.address && i.amount);
    },
    transactionFee() {
      return this.totalInputs.minus(this.totalOutputs);
    },
    validFees() {
      return this.requiredFee.lte(this.transactionFee);
    },
    validTransactionProperties() {
      return [this.inputs, this.outputs];
    }
  },
  methods: {
    pickAddressFromAddressBook(address) {
      clipboard.writeText(address);
      this.$store.commit('snackInfo', 'Address copied to the clipboard');
      const vuetify = this.$vuetify;
      this.$nextTick(() => vuetify.goTo('#transaction'));
    },
    displayError(e) {
      this.errorMessage = e.message;
    },
    addInoutput: function(type) {
      this[type].push(newInoutput());
    },
    deleteInoutput(type, id) {
      this[type] = this[type].filter(v => v.id !== id);
    },
    async sendTransactionForConfirmation() {
      this.errorMessage = '';
      this.transactionSentMessage = '';

      if (this.$refs.form.validate() && this.validTransaction && this.validFees) {
        try {
          if (this.$store.state.ledgerMode) {
            // This build an unsigned transaction that will be signed in the confirmation dialog
            const tx = await buildTransaction(this.inputs, this.outputs);
            this.$refs.ledgerConfirmTransactionDialog.show(tx);
          } else {
            // This build a signed transaction that just needs to be visually acknowledged by the user
            const tx = await buildTransaction(this.inputs, this.outputs, this.$store.state.keystore.store);
            this.$refs.confirmTransactionDialog.show(tx);
          }
        } catch (e) {
          this.errorMessage = e.message;
        }
      }
    },
    async getEcRate() {
      let ecRate = this.cache.get('ecRate');
      if (!ecRate) {
        const factomd = this.$store.getters['factomd/cli'];
        ecRate = await factomd.getEntryCreditRate();
        this.cache.set('ecRate', ecRate);
      }
      return ecRate;
    },
    async send(signedTransaction) {
      try {
        this.sending = true;

        const cli = this.$store.getters['factomd/cli'];
        const txId = await cli.sendTransaction(signedTransaction, { timeout: 60 });

        this.$store.dispatch('address/fetchFctBalances');
        this.$store.dispatch('address/fetchEcBalances');
        this.transactionSentMessage = `Transaction sent. ID: ${txId}`;
        this.$refs.form.reset();
        this.inputs = [newInoutput()];
        this.outputs = [newInoutput()];
      } catch (e) {
        this.errorMessage = e.message;
      } finally {
        this.sending = false;
      }
    }
  },
  watch: {
    validTransactionProperties: {
      async handler() {
        if (this.totalOutputs.gt(this.totalInputs)) {
          this.validTransaction = false;
          this.transactionError = 'Sum of outputs is greater that sum of inputs.';
          return;
        } else {
          this.validTransaction = true;
          this.transactionError = '';
        }

        const ecRate = await this.getEcRate();
        const inputs = this.inputs.filter(i => i.address && i.amount);
        const outputs = this.outputs.filter(i => i.address && i.amount);

        if (inputs.length === 0 || outputs.length === 0) {
          return;
        }

        this.requiredFee = new Big(computeRequiredFees(inputs, outputs, ecRate)).div(FACTOSHI_MULTIPLIER);
      },
      deep: true
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
