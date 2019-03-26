<template>
  <v-form v-model="valid" ref="form" @submit.prevent="confirmTransaction" lazy-validation>
    <v-layout row wrap align-baseline>
      <v-flex xs11 md7 offset-md2>
        <v-text-field
          v-model="address"
          label="Recipient address"
          counter="52"
          :rules="addressRules"
          :disabled="burn"
          clearable
          required
          solo
        ></v-text-field>
      </v-flex>
      <v-flex xs1 md1 text-xs-center>
        <v-icon title="Burn tokens" :color="fireColor" @click="clickBurn">fas fa-fire-alt</v-icon>
      </v-flex>
      <v-flex xs12 md6 offset-md2>
        <v-text-field
          placeholder="Amount"
          type="number"
          v-model.number="amount"
          min="0"
          :suffix="symbol"
          :rules="amountRules"
          required
          solo
        ></v-text-field>
      </v-flex>
      <v-flex xs12 md2 text-xs-right>
        <v-btn color="primary" large :disabled="!valid" type="submit" :loading="sending"
          >Send
          <v-icon right>send</v-icon>
        </v-btn>
      </v-flex>

      <!-- Alerts transaction success/failure-->
      <v-flex v-if="errorMessage" xs12 md8 offset-md2>
        <v-alert :value="true" type="error" outline dismissible>{{ errorMessage }}</v-alert>
      </v-flex>
      <v-flex xs12>
        <v-alert :value="transactionSentMessage" type="success" outline dismissible>{{
          transactionSentMessage
        }}</v-alert>
      </v-flex>
    </v-layout>

    <!-- Dialogs -->
    <ConfirmTransactionDialog
      ref="confirmTransactionDialog"
      :amount="amount"
      :address="address"
      :symbol="symbol"
      @confirmed="send"
    ></ConfirmTransactionDialog>
    <ConfirmBurnDialog ref="confirmBurnDialog" :amount="amount" :symbol="symbol" @confirmed="send"></ConfirmBurnDialog>
  </v-form>
</template>

<script>
import Promise from 'bluebird';
import { isValidPublicFctAddress } from 'factom';
import SendTransaction from '@/mixins/SendTransaction';
import { FAT0 } from '@fat-token/fat-js';
const {
  Transaction: { TransactionBuilder }
} = FAT0;
import ConfirmTransactionDialog from './CreateBasicTransaction/ConfirmTransactionDialog';
import ConfirmBurnDialog from './CreateBasicTransaction/ConfirmBurnDialog';

export default {
  components: { ConfirmTransactionDialog, ConfirmBurnDialog },
  mixins: [SendTransaction],
  data() {
    return {
      address: '',
      amount: 0,
      burn: false,
      valid: true,
      errorMessage: '',
      addressRules: [v => this.burn || isValidPublicFctAddress(v) || 'Invalid public FCT address']
    };
  },
  props: ['balances', 'symbol', 'tokenCli'],
  computed: {
    fireColor() {
      return this.burn ? 'error' : 'grey';
    },
    totalBalance() {
      return this.balances.reduce((acc, val) => acc + val.balance, 0);
    },
    selfAddress() {
      return this.balances.find(b => b.address === this.address);
    },
    amountRules() {
      const totalBalance = this.totalBalance;
      const selfAddress = this.selfAddress;
      return [
        amount => (typeof amount === 'number' && amount > 0) || 'Amount must be strictly positive',
        function(amount) {
          if (selfAddress) {
            return amount <= totalBalance - selfAddress.balance || 'Not enough funds available';
          } else {
            return amount <= totalBalance || 'Not enough funds available';
          }
        }
      ];
    }
  },
  methods: {
    async confirmTransaction() {
      this.transactionSentMessage = '';
      if (this.$refs.form.validate()) {
        if (this.burn) {
          this.$refs.confirmBurnDialog.show();
        } else {
          this.$refs.confirmTransactionDialog.show();
        }
      }
    },
    clickBurn() {
      this.burn = !this.burn;
      if (this.burn) {
        this.address = 'Burning address';
      } else {
        this.address = '';
      }
    },
    async buildTransaction() {
      const outputAddress = this.burn ? 'FA1zT4aFpEvcnPqPCigB3fvGu4Q4mTXY22iiuV69DqE1pNhdF2MC' : this.address;
      // Greedy algorithm to select inputs
      const inputs = [];
      let amountToCover = this.amount;
      for (const b of this.balances) {
        // Output address must be excluded from the choices of inputs
        // otherwise it would be an invalid transaction as per fat0 standard
        if (b.address !== outputAddress && b.balance > 0) {
          if (amountToCover - b.balance > 0) {
            inputs.push({ address: b.address, amount: b.balance });
            amountToCover -= b.balance;
          } else {
            inputs.push({ address: b.address, amount: amountToCover });
            break;
          }
        }
      }

      // Get inputs secret keys
      const walletd = this.$store.getters['walletd/cli'];
      const inputsSecrets = await Promise.map(inputs, async function(input) {
        const { secret } = await walletd.call('address', {
          address: input.address
        });
        return { secret, amount: input.amount };
      });

      // Build transaction object
      const txBuilder = new TransactionBuilder(this.tokenCli.getTokenChainId()).output(outputAddress, this.amount);
      for (const input of inputsSecrets) {
        txBuilder.input(input.secret, input.amount);
      }

      return txBuilder.build();
    },
    async send() {
      await this.sendTransaction();
      if (this.transactionSentMessage) {
        this.burn = false;
      }
    }
  }
};
</script>

<style scoped></style>
