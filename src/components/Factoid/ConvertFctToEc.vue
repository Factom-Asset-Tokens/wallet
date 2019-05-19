<template>
  <div>
    <v-sheet class="elevation-1 vsheet-bottom-margin">
      <v-container id="transaction">
        <v-layout wrap>
          <v-flex xs12 text-xs-center class="display-1 secondary--text" mb-1> {{ totalFctBalanceText }} FCT </v-flex>
          <v-flex xs12 text-xs-center class="display-1 secondary--text" mb-5> {{ totalEcBalanceText }} EC </v-flex>
        </v-layout>
        <v-form v-model="valid" ref="form" @submit.prevent="confirmTransaction" lazy-validation>
          <v-layout wrap>
            <v-flex xs12 md8 offset-md2>
              <v-text-field
                v-model="outputAddress"
                label="Recipient EC address"
                counter="52"
                :rules="addressRules"
                clearable
                required
                single-line
                box
              ></v-text-field>
            </v-flex>
            <v-flex xs12 md6 offset-md2>
              <v-text-field
                placeholder="Amount"
                type="number"
                v-model="outputAmount"
                min="0"
                step="1"
                suffix="EC"
                :rules="amountRules"
                :error-messages="amountErrors"
                required
                single-line
                box
              ></v-text-field>
            </v-flex>
            <v-flex xs12 md2 text-xs-right>
              <v-btn color="primary" large :disabled="!valid" type="submit" :loading="sending">
                Convert
                <v-icon right>local_play</v-icon>
              </v-btn>
            </v-flex>
            <!-- Alerts -->
            <v-flex v-if="valid && outputAddress && fctCost" xs12 md8 offset-md2>
              <v-alert :value="true" type="info" outline>
                <strong>{{ fctCost }} FCT</strong>
                will be converted to entry credits (rate: 1 FCT =
                {{ rate.toLocaleString() }} EC).
              </v-alert>
            </v-flex>
            <v-flex v-if="errorMessage" xs12 md8 offset-md2>
              <v-alert :value="true" type="error" outline dismissible>{{ errorMessage }}</v-alert>
            </v-flex>
            <v-flex xs12>
              <v-alert :value="transactionSentMessage" type="success" outline dismissible>
                {{ transactionSentMessage }}
              </v-alert>
            </v-flex>
          </v-layout>
          <!-- Dialogs -->
          <ConfirmFctToEcConversionDialog
            ref="confirmTransactionDialog"
            :address="outputAddress"
            :ecAmount="outputAmount"
            :fctCost="fctCost"
            @confirmed="send"
          ></ConfirmFctToEcConversionDialog>
        </v-form>
      </v-container>
    </v-sheet>
    <AddressBook type="ec" @address="pickAddressFromAddressBook"></AddressBook>
  </div>
</template>

<script>
import Big from 'bignumber.js';
import NodeCache from 'node-cache';
import { isValidPublicEcAddress } from 'factom';
import { buildTransaction, getFeeAdjustedTransaction } from './TransactionHelper';
import ConfirmFctToEcConversionDialog from './ConvertFctToEc/ConfirmFctToEcConversionDialog';
import AddressBook from '@/components/AddressBook';

const FACTOSHI_MULTIPLIER = new Big(100000000);

export default {
  components: { ConfirmFctToEcConversionDialog, AddressBook },
  data() {
    return {
      outputAddress: '',
      outputAmount: '',
      fctCost: '',
      rate: 0,
      valid: true,
      errorMessage: '',
      amountErrors: [],
      transactionSentMessage: '',
      sending: false,
      addressRules: [v => isValidPublicEcAddress(v) || 'Invalid public EC address']
    };
  },
  created() {
    this.cache = new NodeCache({ stdTTL: 60, checkperiod: 10 });
  },
  computed: {
    balances() {
      return this.$store.state.address.fctBalances;
    },
    totalFctBalance() {
      return this.$store.getters['address/totalFctBalance'];
    },
    totalFctBalanceText() {
      return this.totalFctBalance.div(FACTOSHI_MULTIPLIER).toFormat();
    },
    totalEcBalanceText() {
      return this.$store.getters['address/totalEcBalance'].toFormat();
    },
    amountRules() {
      return [
        amount => (new Big(amount).isInteger() && new Big(amount).gt(0)) || 'Amount must be strictly positive integer'
      ];
    },
    transactionProperties() {
      return [this.outputAmount, this.outputAddress];
    },
    isAddressOk() {
      return this.addressRules.every(f => typeof f(this.outputAddress) !== 'string');
    },
    isAmountsOk() {
      return this.amountRules.every(f => typeof f(this.outputAmount) !== 'string');
    }
  },
  methods: {
    pickAddressFromAddressBook(address) {
      this.outputAddress = address;
      const vuetify = this.$vuetify;
      this.$nextTick(() => vuetify.goTo('#transaction'));
    },
    async confirmTransaction() {
      this.transactionSentMessage = '';
      if (this.$refs.form.validate()) {
        this.$refs.confirmTransactionDialog.show();
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
    async send() {
      try {
        this.errorMessage = '';
        this.sending = true;
        const tx = await buildTransaction(
          this.$store,
          this.totalFctBalance,
          this.balances,
          this.outputAddress,
          new Big(this.outputAmount)
        );
        const cli = this.$store.getters['factomd/cli'];
        const txId = await cli.sendTransaction(tx, { timeout: 60 });
        this.$store.dispatch('address/fetchFctBalances');
        this.$store.dispatch('address/fetchEcBalances');
        this.transactionSentMessage = `Transaction sent. ID: ${txId}`;
        this.$refs.form.reset();
      } catch (e) {
        this.errorMessage = e.message;
      } finally {
        this.sending = false;
      }
    }
  },
  watch: {
    async transactionProperties() {
      // Unfortunately the value of `valid` is not up to date when reaching this point
      // so we have to re-compute the validity of inputs manually.
      if (this.isAddressOk && this.isAmountsOk) {
        const ecRate = await this.getEcRate();
        const factoshiCost = new Big(this.outputAmount).times(ecRate);

        // Fast approximation that doesn't take into account fees
        if (factoshiCost.lt(this.totalFctBalance)) {
          try {
            const tx = getFeeAdjustedTransaction(
              this.totalFctBalance,
              this.balances,
              this.outputAddress,
              factoshiCost,
              ecRate
            );

            this.amountErrors = [];
            this.fctCost = new Big(tx.totalInputs).div(FACTOSHI_MULTIPLIER).toFormat();
            this.rate = FACTOSHI_MULTIPLIER.div(ecRate).toFormat();
          } catch (e) {
            // In case if the total with fees did exceed the funds available
            if (e.message.includes('Not enough funds')) {
              this.amountErrors = ['Not enough FCT availables'];
            } else {
              throw e;
            }
          }
        } else {
          this.amountErrors = ['Not enough FCT availables'];
        }
      } else {
        this.amountErrors = [];
      }
    }
  },
  beforeDestroy() {
    this.cache.close();
  }
};
</script>

<style scoped>
.vsheet-bottom-margin {
  margin-bottom: 24px;
}
</style>
