<template>
  <div>
    <v-sheet class="elevation-1 vsheet-bottom-margin">
      <v-container id="transaction">
        <v-layout wrap>
          <v-flex xs12 text-xs-center class="display-1 secondary--text" mb-5> {{ totalBalanceText }} FCT </v-flex>
        </v-layout>
        <v-form v-model="valid" ref="form" @submit.prevent="confirmTransaction" lazy-validation>
          <v-layout wrap>
            <!-- Input address selection -->
            <v-flex xs12 md8 offset-md2>
              <v-select
                :items="inputAddresses"
                label="Paying FCT address"
                :rules="addressRules"
                v-model="inputAddress"
                single-line
                box
              ></v-select>
            </v-flex>

            <!-- Output address -->
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

            <!-- Amount -->
            <v-flex xs12 md6 offset-md2>
              <v-text-field
                placeholder="Amount"
                type="number"
                v-model="outputAmount"
                min="0"
                suffix="FCT"
                :rules="amountRules"
                required
                single-line
                box
              ></v-text-field>
            </v-flex>
            <v-flex xs12 md2 text-xs-right>
              <v-btn color="primary" large :disabled="!valid" type="submit" :loading="sending">
                Send
                <v-icon right>send</v-icon>
              </v-btn>
            </v-flex>
            <!-- Alerts -->
            <v-flex v-show="showFee" xs12 md8 offset-md2>
              <v-alert :value="true" icon="info" color="primary" outline>
                An additional transaction fee of
                <strong>{{ feeText }} FCT</strong>
                will be deducted.
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
          <ConfirmBasicTransactionDialog
            ref="confirmTransactionDialog"
            @confirmed="send"
          ></ConfirmBasicTransactionDialog>
        </v-form>
      </v-container>
    </v-sheet>
    <AddressBook type="fct" @address="pickAddressFromAddressBook"></AddressBook>
  </div>
</template>

<script>
import Big from 'bignumber.js';
import NodeCache from 'node-cache';
import { isValidPublicFctAddress } from 'factom';
import { computeSisoRequiredFees, getFeeAdjustedSisoTransaction } from './TransactionHelper';
import ConfirmBasicTransactionDialog from './CreateBasicTransaction/ConfirmBasicTransactionDialog';
import AddressBook from '@/components/AddressBook';

const ZERO = new Big(0);
const FACTOSHI_MULTIPLIER = new Big(100000000);

export default {
  components: { ConfirmBasicTransactionDialog, AddressBook },
  data() {
    return {
      inputAddress: '',
      outputAddress: '',
      outputAmount: '',
      fee: ZERO,
      valid: true,
      errorMessage: '',
      transactionSentMessage: '',
      sending: false,
      addressRules: [v => isValidPublicFctAddress(v) || 'Invalid public FCT address']
    };
  },
  created() {
    this.cache = new NodeCache({ stdTTL: 60, checkperiod: 10 });
    this.refreshFee();
  },
  computed: {
    showFee() {
      return this.inputAddress && this.outputAddress && this.outputAmount;
    },
    feeText() {
      return this.fee.div(FACTOSHI_MULTIPLIER).toFormat();
    },
    balances() {
      return this.$store.state.address.fctBalances;
    },
    balancesWithNames() {
      return this.$store.getters['address/fctAddressesWithNames'].map(o => ({
        address: o.address,
        balance: this.balances[o.address] || new Big(0),
        name: o.name
      }));
    },
    totalBalance() {
      return this.$store.getters['address/totalFctBalance'];
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
    },
    totalBalanceText() {
      return this.totalBalance.div(FACTOSHI_MULTIPLIER).toFormat();
    },
    amountRules() {
      return [
        amount => (amount && ZERO.lt(amount)) || 'Amount must be strictly positive',
        amount => {
          if (!this.inputAddress) {
            return true;
          }

          const availableBalance = this.balances[this.inputAddress];
          const factoshiAmount = FACTOSHI_MULTIPLIER.times(amount);
          if (availableBalance.gte(factoshiAmount.plus(this.fee))) {
            return true;
          }

          if (availableBalance.gte(factoshiAmount)) {
            return 'Not enough funds to pay the transaction fee';
          } else {
            return 'Not enough funds available';
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
      this.errorMessage = '';
      this.transactionSentMessage = '';
      if (this.$refs.form.validate()) {
        const ecRate = await this.getEcRate();

        const tx = getFeeAdjustedSisoTransaction({
          inputAddress: this.inputAddress,
          outputAddress: this.outputAddress,
          amount: this.outputAmount,
          ecRate,
          keystore: this.$store.state.keystore.store
        });
        this.$refs.confirmTransactionDialog.show(tx);
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
      this.refreshFee();
    },
    async refreshFee() {
      const ecRate = await this.getEcRate();
      this.fee = computeSisoRequiredFees(ecRate);
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
