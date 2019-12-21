<template>
  <div>
    <v-sheet class="elevation-1 vsheet-bottom-margin">
      <v-container id="transaction">
        <v-layout wrap>
          <v-flex xs12 text-xs-center class="display-1 font-weight-light secondary--text" mb-1>
            <NumberWithDecimals :number="totalFctBalanceText"></NumberWithDecimals> FCT
          </v-flex>
          <v-flex xs12 text-xs-center class="display-1 font-weight-light secondary--text" mb-5>
            {{ totalEcBalanceText }} EC
          </v-flex>
        </v-layout>
        <v-form v-model="valid" ref="form" @submit.prevent="confirmTransaction" lazy-validation>
          <v-layout wrap>
            <!-- Input address selection -->
            <v-flex xs12 md8 offset-md2>
              <v-select
                :items="inputAddresses"
                label="Paying FCT address"
                :rules="fctAddressRules"
                v-model="inputAddress"
                no-data-text="No address with fund available"
                single-line
                box
              ></v-select>
            </v-flex>

            <!-- Output address -->
            <v-flex xs12 md8 offset-md2>
              <v-text-field
                v-model="outputAddress"
                label="Recipient EC address"
                counter="52"
                :rules="ecAddressRules"
                clearable
                required
                single-line
                box
              ></v-text-field>
            </v-flex>

            <!-- Amount -->
            <v-flex xs12 md6 offset-md2>
              <v-text-field
                placeholder="Amount"
                type="number"
                v-model="ecAmount"
                min="0"
                step="1"
                suffix="EC"
                :rules="amountRules"
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
            <v-flex v-if="valid && outputAddress && ecAmount" xs12 md8 offset-md2>
              <v-alert :value="true" icon="info" color="primary" outline>
                <strong>{{ fctCostText }} FCT</strong>
                will be converted to Entry Credits (rate: 1 FCT =
                {{ ecRateText }} EC).
              </v-alert>
            </v-flex>
            <v-flex v-if="errorMessage" xs12 md8 offset-md2>
              <v-alert :value="errorMessage" type="error" outline dismissible>{{ errorMessage }}</v-alert>
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
            @confirmed="send"
          ></ConfirmFctToEcConversionDialog>
          <LedgerConfirmFctToEcConversionDialog
            ref="ledgerConfirmTransactionDialog"
            @error="displayError"
            @confirmed="send"
          ></LedgerConfirmFctToEcConversionDialog>
        </v-form>
      </v-container>
    </v-sheet>
    <AddressBook type="ec" @address="pickAddressFromAddressBook"></AddressBook>
  </div>
</template>

<script>
import Big from 'bignumber.js';
import NodeCache from 'node-cache';
import { isValidPublicEcAddress, isValidPublicFctAddress } from 'factom';
import { computeSisoRequiredFees, getFeeAdjustedSisoTransaction } from './TransactionHelper';
import ConfirmFctToEcConversionDialog from './ConvertFctToEc/ConfirmFctToEcConversionDialog';
import LedgerConfirmFctToEcConversionDialog from './ConvertFctToEc/LedgerConfirmFctToEcConversionDialog';
import AddressBook from '@/components/AddressBook';
import NumberWithDecimals from '@/components/NumberWithDecimals';

const FACTOSHI_MULTIPLIER = new Big(100000000);
const ZERO = new Big(0);

export default {
  components: { ConfirmFctToEcConversionDialog, LedgerConfirmFctToEcConversionDialog, AddressBook, NumberWithDecimals },
  data() {
    return {
      inputAddress: '',
      outputAddress: '',
      ecAmount: '',
      fctCostText: '',
      ecRate: 0,
      ecRateText: '',
      valid: true,
      errorMessage: '',
      transactionSentMessage: '',
      sending: false,
      ecAddressRules: [v => isValidPublicEcAddress(v) || 'Invalid public EC address'],
      fctAddressRules: [v => isValidPublicFctAddress(v) || 'Invalid public FCT address']
    };
  },
  created() {
    this.cache = new NodeCache({ stdTTL: 60, checkperiod: 10 });
  },
  computed: {
    balances() {
      return this.$store.state.address.fctBalances;
    },
    balancesWithNames() {
      return this.$store.getters['address/fctAddressesWithNames'].map(o => ({
        address: o.address,
        balance: this.balances[o.address] || ZERO,
        name: o.name
      }));
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
        amount => (new Big(amount).isInteger() && new Big(amount).gt(0)) || 'Amount must be strictly positive integer',
        amount => {
          if (!this.inputAddress) {
            return true;
          }

          const availableBalance = this.balances[this.inputAddress];
          return new Big(amount).times(this.ecRate).lte(availableBalance) || 'Not enough funds available';
        }
      ];
    },
    inputAddresses() {
      return this.balancesWithNames
        .filter(b => b.balance.gt(ZERO))
        .map(b => {
          const text = `${b.name || b.address} (${b.balance.div(FACTOSHI_MULTIPLIER).toFormat()} FCT)`;
          return {
            value: b.address,
            text
          };
        });
    }
  },
  methods: {
    displayError(e) {
      this.errorMessage = e.message;
    },
    pickAddressFromAddressBook(address) {
      this.outputAddress = address;
      const vuetify = this.$vuetify;
      this.$nextTick(() => vuetify.goTo('#transaction'));
    },
    async confirmTransaction() {
      this.transactionSentMessage = '';
      this.errorMessage = '';

      if (this.$refs.form.validate()) {
        const ledgerMode = this.$store.state.ledgerMode;

        const ecRate = await this.getEcRate();
        const fctAmount = new Big(this.ecAmount).times(ecRate).div(FACTOSHI_MULTIPLIER);
        const keystore = ledgerMode ? null : this.$store.state.keystore.store;

        const tx = getFeeAdjustedSisoTransaction({
          inputAddress: this.inputAddress,
          outputAddress: this.outputAddress,
          amount: fctAmount,
          ecRate,
          keystore
        });

        if (ledgerMode) {
          this.$refs.ledgerConfirmTransactionDialog.show(tx, ecRate);
        } else {
          this.$refs.confirmTransactionDialog.show(tx, ecRate);
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
    async send(tx) {
      try {
        this.sending = true;

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
    async ecAmount() {
      const ecRate = await this.getEcRate();
      this.ecRate = ecRate;
      this.ecRateText = FACTOSHI_MULTIPLIER.div(ecRate).toFormat();
      const fee = computeSisoRequiredFees(ecRate);
      this.fctCostText = new Big(this.ecAmount)
        .times(ecRate)
        .plus(fee)
        .div(FACTOSHI_MULTIPLIER)
        .toFormat();
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
