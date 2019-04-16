<template>
  <div>
    <v-sheet class="elevation-1 vsheet-bottom-margin">
      <v-container id="transaction">
        <v-layout wrap>
          <v-flex xs12 text-xs-center class="display-1 secondary--text" mb-5> {{ totalBalanceText }} FCT </v-flex>
        </v-layout>
        <v-form v-model="valid" ref="form" @submit.prevent="confirmTransaction" lazy-validation>
          <v-layout wrap>
            <v-flex xs12 md8 offset-md2>
              <v-text-field
                v-model="outputAddress"
                label="Recipient FCT address"
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
                suffix="FCT"
                :rules="amountRules"
                :error-messages="amountErrors"
                required
                single-line
                box
              ></v-text-field>
            </v-flex>
            <v-flex xs12 md2 text-xs-right>
              <v-btn color="primary" large :disabled="!valid" type="submit" :loading="sending"
                >Send
                <v-icon right>send</v-icon>
              </v-btn>
            </v-flex>
            <!-- Alerts -->
            <v-flex v-if="valid && outputAddress && feeText" xs12 md8 offset-md2>
              <v-alert :value="true" type="info" outline>
                An additional transaction fee of
                <strong>{{ feeText }} FCT</strong>
                will be deducted.
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
          <ConfirmBasicTransactionDialog
            ref="confirmTransactionDialog"
            :address="outputAddress"
            :amount="outputAmount"
            :feeText="feeText"
            @confirmed="send"
          ></ConfirmBasicTransactionDialog>
        </v-form>
      </v-container>
    </v-sheet>
    <AddressBook :type="'fct'" @address="pickAddressFromAddressBook"></AddressBook>
  </div>
</template>

<script>
import Big from 'bignumber.js';
import NodeCache from 'node-cache';
import { isValidPublicFctAddress } from 'factom';
import { buildTransaction, getFeeAdjustedTransaction } from './TransactionHelper';
import ConfirmBasicTransactionDialog from './CreateBasicTransaction/ConfirmBasicTransactionDialog';
import AddressBook from '@/components/AddressBook';

const ZERO = new Big(0);
const FACTOSHI_MULTIPLIER = new Big(100000000);

export default {
  components: { ConfirmBasicTransactionDialog, AddressBook },
  data() {
    return {
      outputAddress: '',
      outputAmount: '',
      feeText: '',
      valid: true,
      errorMessage: '',
      amountErrors: [],
      transactionSentMessage: '',
      sending: false,
      addressRules: [v => isValidPublicFctAddress(v) || 'Invalid public FCT address']
    };
  },
  created() {
    this.cache = new NodeCache({ stdTTL: 60, checkperiod: 10 });
  },
  computed: {
    isAddressOk() {
      return this.addressRules.every(f => typeof f(this.outputAddress) !== 'string');
    },
    isAmountsOk() {
      return this.amountRules.every(f => typeof f(this.outputAmount) !== 'string');
    },
    factoshiOutputAmount() {
      return FACTOSHI_MULTIPLIER.times(this.outputAmount);
    },
    balances() {
      return this.$store.state.address.fctBalances;
    },
    totalBalance() {
      return this.$store.getters['address/totalFctBalance'];
    },
    totalBalanceText() {
      return this.totalBalance.div(FACTOSHI_MULTIPLIER).toFormat();
    },
    transactionProperties() {
      return [this.outputAmount, this.outputAddress];
    },
    amountRules() {
      const totalBalance = this.totalBalance;
      const selfAddressBalance = this.balances[this.outputAddress] || ZERO;
      return [
        amount => (amount && ZERO.lt(amount)) || 'Amount must be strictly positive',
        function(amount) {
          if (!amount) {
            return 'Amount must be strictly positive';
          }

          if (selfAddressBalance) {
            return (
              FACTOSHI_MULTIPLIER.times(amount).lte(totalBalance.minus(selfAddressBalance)) ||
              'Not enough funds available'
            );
          } else {
            return FACTOSHI_MULTIPLIER.times(amount).lte(totalBalance) || 'Not enough funds available';
          }
        }
      ];
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
          this.totalBalance,
          this.balances,
          this.outputAddress,
          this.factoshiOutputAmount
        );
        const cli = this.$store.getters['factomd/cli'];
        const txId = await cli.sendTransaction(tx, { timeout: 60 });
        this.$store.commit('address/addRecentlyUsed', this.outputAddress);
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

        try {
          const tx = getFeeAdjustedTransaction(
            this.totalBalance,
            this.balances,
            this.outputAddress,
            this.factoshiOutputAmount,
            ecRate
          );

          this.amountErrors = [];
          this.feeText = new Big(tx.feesPaid).div(FACTOSHI_MULTIPLIER).toFormat();
        } catch (e) {
          // This corner case happens if outputAmount + fees > totalBalance
          // which cannot be detected until we try to evaluate the fees
          if (e.message.includes('Not enough funds')) {
            this.amountErrors = ['Not enough FCT availables'];
          } else {
            throw e;
          }
        }
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
