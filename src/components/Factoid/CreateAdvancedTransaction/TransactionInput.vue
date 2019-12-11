<template>
  <v-layout wrap align-baseline justify-center>
    <v-flex xs12 md8 pr-4>
      <v-select
        :items="availableAddresses"
        :rules="addressRules"
        label="Address"
        class="break-word"
        v-model="address"
        @input="$emit('input', { address, amount, id: value.id })"
        dense
        single-line
        box
      ></v-select>
    </v-flex>
    <v-flex xs11 md3>
      <v-text-field
        v-if="address"
        v-model="amount"
        :rules="amountRules"
        type="number"
        suffix="FCT"
        min="0"
        :max="balance"
        label="Amount"
        ref="amountInput"
        @input="$emit('input', { address, amount, id: value.id })"
        single-line
        box
        required
      ></v-text-field>
    </v-flex>
    <v-flex xs1 text-xs-center>
      <v-icon v-if="!first" @click="$emit('delete')">delete</v-icon>
    </v-flex>
  </v-layout>
</template>

<script>
import Big from 'bignumber.js';
import { isValidPublicFctAddress } from 'factom';

const FACTOSHI_MULTIPLIER = new Big(100000000);
const ZERO = new Big(0);

export default {
  data() {
    return {
      address: this.value.address,
      amount: this.value.amount,
      addressRules: [address => isValidPublicFctAddress(address) || 'Invalid public FCT address']
    };
  },
  props: ['value', 'first', 'balances', 'alreadySelectedAddresses'],
  computed: {
    balance() {
      return this.address ? this.balances.find(b => b.address === this.address).balance.div(FACTOSHI_MULTIPLIER) : ZERO;
    },
    amountRules() {
      const maxAmount = this.balance;
      return [
        amount => (amount && new Big(amount).gt(0)) || 'Amount must be strictly positive',
        amount => maxAmount.gte(amount) || "Address doesn't hold enough funds"
      ];
    },
    availableAddresses() {
      return this.balances
        .filter(
          b => b.balance.gt(ZERO) && (!this.alreadySelectedAddresses.has(b.address) || b.address === this.address)
        )
        .map(b => {
          const text = `${b.name || b.address} (${b.balance.div(FACTOSHI_MULTIPLIER).toFormat()} FCT)`;

          return {
            value: b.address,
            text
          };
        });
    }
  }
};
</script>

<style scoped></style>
