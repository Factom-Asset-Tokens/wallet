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
            <v-flex xs12 lg8 offset-lg2>
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
            <v-flex xs12 lg8 offset-lg2>
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
            <v-flex xs12 lg1 offset-lg2>
              <v-checkbox
                v-model="maxCheck"
                color="primary"
                label="Max"
                title="Send all the input address FCT while accounting for fees"
              ></v-checkbox
            ></v-flex>
            <v-flex xs12 lg5>
              <v-text-field
                :disabled="maxCheck"
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
            <v-flex xs12 lg2 text-xs-right>
              <v-btn color="primary" large :disabled="!valid" type="submit" :loading="sending">
                Send
                <v-icon right>send</v-icon>
              </v-btn>
            </v-flex>
            <!-- Alerts -->
            <v-flex v-show="showFee" xs12 lg8 offset-lg2>
              <v-alert :value="true" icon="info" color="primary" outline>
                An additional transaction fee of
                <strong>{{ feeText }} FCT</strong>
                will be added.
              </v-alert>
            </v-flex>
            <v-flex v-if="errorMessage" xs12 lg8 offset-lg2>
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
          <LedgerConfirmBasicTransactionDialog
            ref="ledgerConfirmTransactionDialog"
            @error="displayError"
            @confirmed="send"
          ></LedgerConfirmBasicTransactionDialog>
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
import LedgerConfirmBasicTransactionDialog from './CreateBasicTransaction/LedgerConfirmBasicTransactionDialog';
import AddressBook from '@/components/AddressBook';

const ZERO = new Big(0);
const FACTOSHI_MULTIPLIER = new Big(100000000);

export default {
  components: { ConfirmBasicTransactionDialog, LedgerConfirmBasicTransactionDialog, AddressBook },
  data() {
    return {
      maxCheck: false,
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
    maxAmountWatchh() {
      return [this.inputAddress, this.maxCheck];
    },
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
        amount => this.maxCheck || (amount && ZERO.lt(amount)) || 'Amount must be strictly positive',
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
    displayError(e) {
      this.errorMessage = e.message;
    },
    pickAddressFromAddressBook(address) {
      this.outputAddress = address;
      const vuetify = this.$vuetify;
      this.$nextTick(() => vuetify.goTo('#transaction'));
    },
    async confirmTransaction() {
      this.errorMessage = '';
      this.transactionSentMessage = '';
      if (this.$refs.form.validate()) {
        const ledgerMode = this.$store.state.ledgerMode;
        const ecRate = await this.getEcRate();
        const keystore = ledgerMode ? null : this.$store.state.keystore.store;

        const tx = getFeeAdjustedSisoTransaction({
          inputAddress: this.inputAddress,
          outputAddress: this.outputAddress,
          amount: this.outputAmount,
          ecRate,
          keystore
        });

        if (ledgerMode) {
          this.$refs.ledgerConfirmTransactionDialog.show(tx);
        } else {
          this.$refs.confirmTransactionDialog.show(tx);
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
      this.refreshFee();
    },
    async refreshFee() {
      const ecRate = await this.getEcRate();
      this.fee = computeSisoRequiredFees(ecRate);
    }
  },
  watch: {
    maxAmountWatchh() {
      if (this.maxCheck && this.inputAddress) {
        this.outputAmount = this.balances[this.inputAddress]
          .minus(this.fee)
          .div(FACTOSHI_MULTIPLIER)
          .toNumber();
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
