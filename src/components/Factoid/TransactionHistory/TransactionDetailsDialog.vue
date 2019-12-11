<template>
  <v-dialog v-model="display" max-width="1024px" @keydown.esc="display = false" @keydown.enter="display = false">
    <v-card v-if="transaction">
      <v-card-title class="headline primary white--text" primary-title
        >Transaction details<v-spacer></v-spacer
        ><v-btn flat icon @click="display = false"><v-icon>close</v-icon></v-btn></v-card-title
      >
      <v-card-text>
        <v-container fluid class="subheading">
          <v-layout wrap>
            <v-flex xs2 class="font-weight-bold secondary--text">Transaction ID</v-flex>
            <v-flex xs10>{{ txId }}</v-flex>
            <v-flex xs2 class="font-weight-bold secondary--text">Time</v-flex>
            <v-flex xs10>{{ timestamp }}</v-flex>
            <v-flex xs2 class="font-weight-bold secondary--text">Block height</v-flex>
            <v-flex xs10>{{ blockHeight }}</v-flex>
            <v-flex xs2 mb-4 class="font-weight-bold secondary--text">Fees</v-flex>
            <v-flex xs10 mb-4>{{ fees }} FCT</v-flex>
            <v-flex v-if="inputs.length === 0" xs12 mb-4 class="secondary--text font-weight-bold">
              <v-icon left color="secondary">star</v-icon>Coinbase transaction
            </v-flex>
            <v-flex v-if="inputs.length > 0" xs12 class="font-weight-bold secondary--text">
              <v-icon left color="secondary">fa-sign-in-alt</v-icon>Inputs
            </v-flex>
            <InoutputDetails
              v-if="inputs.length > 0"
              :ios="inputs"
              symbol="FCT"
              :addresses="addresses"
            ></InoutputDetails>
            <v-flex v-if="fctOutputs.length > 0" xs12 class="font-weight-bold secondary--text">
              <v-icon left color="secondary">fa-sign-out-alt</v-icon>FCT Outputs
            </v-flex>
            <InoutputDetails
              v-if="fctOutputs.length > 0"
              :ios="fctOutputs"
              symbol="FCT"
              :addresses="addresses"
            ></InoutputDetails>
            <v-flex v-if="ecOutputs.length > 0" xs12 class="font-weight-bold secondary--text">
              <v-icon left color="secondary">fa-sign-out-alt</v-icon>EC Outputs
            </v-flex>
            <InoutputDetails
              v-if="ecOutputs.length > 0"
              :ios="ecOutputs"
              symbol="EC"
              :addresses="addresses"
            ></InoutputDetails>
          </v-layout>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="display = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Big from 'bignumber.js';
import moment from 'moment';
import InoutputDetails from './InoutputDetails';

const FACTOSHI_MULTIPLIER = new Big(100000000);

export default {
  components: { InoutputDetails },
  props: ['addresses'],
  data() {
    return {
      display: false,
      transaction: null
    };
  },
  computed: {
    txId() {
      return this.transaction.txid;
    },
    fees() {
      if (this.transaction.total_input === 0) {
        return 0;
      }
      return new Big(this.transaction.total_input)
        .minus(this.transaction.total_ec_fct_output)
        .minus(this.transaction.total_fct_output)
        .div(FACTOSHI_MULTIPLIER)
        .toFormat();
    },
    blockHeight() {
      return this.transaction.block_height;
    },
    timestamp() {
      return moment(this.transaction.blockchain_date).format('LL LT');
    },
    inputs() {
      return this.transaction.inputs
        .map(input => ({
          key: input.seq_num,
          address: input.address,
          amount: new Big(input.fct_amount).div(FACTOSHI_MULTIPLIER).toFormat()
        }))
        .sort((a, b) => a.key - b.key);
    },
    fctOutputs() {
      return this.transaction.outputs
        .map(output => ({
          key: output.seq_num,
          address: output.address,
          amount: new Big(output.fct_amount).div(FACTOSHI_MULTIPLIER).toFormat()
        }))
        .sort((a, b) => a.key - b.key);
    },
    ecOutputs() {
      return this.transaction.ecoutputs
        .map(output => ({
          key: output.seq_num,
          address: output.address,
          amount: new Big(output.ec_amount).toFormat()
        }))
        .sort((a, b) => a.key - b.key);
    }
  },
  methods: {
    show(transaction) {
      this.transaction = transaction;
      this.display = true;
    }
  }
};
</script>
