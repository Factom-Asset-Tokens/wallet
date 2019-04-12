<template>
  <v-sheet class="elevation-1">
    <v-container>
      <v-form id="advancedTxForm" v-model="validForm" ref="form" @submit.prevent="confirmTransaction" lazy-validation>
        <v-layout wrap>
          <v-flex xs12 pb-4>
            <v-toolbar flat color="primary">
              <v-toolbar-title><v-icon left>fa-sign-in-alt</v-icon>Inputs</v-toolbar-title>

              <v-spacer></v-spacer>
              <div class="total-amount">{{ totalInputs }} {{ symbol }}</div>
              <v-toolbar-items>
                <v-btn flat @click="add('inputs')">
                  <v-icon>add_circle_outline</v-icon>
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
          <v-flex xs12 pt-5 pb-4>
            <v-toolbar flat color="primary">
              <v-toolbar-title><v-icon left>fa-sign-out-alt</v-icon>Outputs</v-toolbar-title>

              <v-spacer></v-spacer>
              <div class="total-amount">{{ totalOutputs }} {{ symbol }}</div>
              <v-toolbar-items>
                <v-btn flat @click="add('outputs')">
                  <v-icon>add_circle_outline</v-icon>
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
                  box
                  required
                ></v-text-field>
              </v-flex>
              <v-flex xs11 md3>
                <v-text-field
                  v-model.number="output.amount"
                  type="number"
                  :suffix="symbol"
                  :rules="outputAmountRules"
                  min="0"
                  label="Amount"
                  box
                  required
                ></v-text-field>
              </v-flex>
              <v-flex xs1 text-xs-center>
                <v-icon v-if="index !== 0" @click="deleteInoutput('outputs', output.id)">delete</v-icon>
              </v-flex>
            </v-layout>
          </v-flex>

          <v-layout align-center wrap>
            <v-flex xs12 sm10>
              <v-alert v-if="sendClicked" :value="!validTransaction" color="error" icon="warning" outline>
                {{ transactionError }}
              </v-alert>
            </v-flex>

            <v-flex xs12 sm2 text-xs-right pt-5>
              <v-btn color="primary" large :disabled="!validForm" type="submit" :loading="sending"
                >Send
                <v-icon right>send</v-icon>
              </v-btn>
            </v-flex>

            <!-- Alerts transaction success/failure-->
            <v-flex v-if="errorMessage" xs12>
              <v-alert :value="true" type="error" outline dismissible>{{ errorMessage }}</v-alert>
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
          :outputs="outputs"
          :symbol="symbol"
          @confirmed="send"
        ></ConfirmTransactionDialog>
      </v-form>
    </v-container>
  </v-sheet>
</template>

<script>
import Promise from 'bluebird';
import { isValidPublicFctAddress } from 'factom';
import SendTransaction from '@/mixins/SendTransaction';
import TransactionInput from './CreateAdvancedTransaction/TransactionInput';
import ConfirmTransactionDialog from './CreateAdvancedTransaction/ConfirmTransactionDialog';
import { FAT0 } from '@fat-token/fat-js';
const {
  Transaction: { TransactionBuilder }
} = FAT0;

const newInoutput = (function() {
  let i = 0;
  return function() {
    return { id: i++, address: '', amount: 0 };
  };
})();

export default {
  components: { TransactionInput, ConfirmTransactionDialog },
  mixins: [SendTransaction],
  data() {
    return {
      sendClicked: false,
      validForm: true,
      validTransaction: true,
      transactionError: '',
      inputs: [],
      outputs: [],
      errorMessage: ''
    };
  },
  props: ['balances', 'symbol', 'tokenCli'],
  created() {
    this.add('inputs');
    this.add('outputs');
  },
  computed: {
    selectedInputAddresses() {
      return new Set(this.inputs.map(i => i.address));
    },
    addressesCount() {
      return this.inputs.concat(this.outputs).reduce((count, val) => {
        count[val.address] ? count[val.address]++ : (count[val.address] = 1);
        return count;
      }, {});
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
        .filter(a => typeof a === 'number')
        .reduce((a, b) => a + b, 0);
    },
    totalOutputs() {
      return this.outputs
        .map(o => o.amount)
        .filter(a => typeof a === 'number')
        .reduce((a, b) => a + b, 0);
    },
    validTransactionProperties() {
      return [this.totalInputs, this.totalOutputs, this.addressesCount];
    }
  },
  methods: {
    add: function(type) {
      this[type].push(newInoutput());
    },
    deleteInoutput(type, id) {
      this[type] = this[type].filter(v => v.id !== id);
    },
    confirmTransaction() {
      this.transactionSentMessage = '';

      if (this.$refs.form.validate()) {
        this.sendClicked = true;
        if (this.validTransaction) {
          this.sendClicked = false;
          this.$refs.confirmTransactionDialog.show();
        }
      }
    },
    async send() {
      await this.sendTransaction();
      if (this.transactionSentMessage) {
        this.inputs = [newInoutput()];
        this.outputs = [newInoutput()];
      }
    },
    async buildTransaction() {
      const txBuilder = new TransactionBuilder(this.tokenCli.getTokenChainId());

      // Get inputs secret keys
      const keystore = this.$store.state.keystore.store;
      const inputsSecrets = await Promise.map(this.inputs, async function(input) {
        const secret = keystore.getSecretKey(input.address);
        return { secret, amount: input.amount };
      });
      for (const input of inputsSecrets) {
        txBuilder.input(input.secret, input.amount);
      }
      for (const output of this.outputs) {
        txBuilder.output(output.address, output.amount);
      }

      return txBuilder.build();
    }
  },
  watch: {
    validTransactionProperties() {
      // An address can appear only once accross both inptus and outputs
      for (const address in this.addressesCount) {
        if (this.addressesCount[address] > 1) {
          this.validTransaction = false;
          this.transactionError = `${address} is used multiple times accross inputs or outputs.`;
          return;
        }
      }

      // Total inputs and outputs must be equal
      if (this.totalInputs !== this.totalOutputs) {
        this.validTransaction = false;
        this.transactionError = 'The sum of inputs and outputs must be equal.';
        return;
      }

      // The amount transfered has to be greater than 0
      if (this.totalInputs === 0) {
        this.validTransaction = false;
        this.transactionError = 'The amount transfered cannot be 0.';
        return;
      }

      this.validTransaction = true;
      this.transactionError = '';
    }
  }
};
</script>

<style scoped>
.total-amount {
  margin-right: 36px;
}
</style>
