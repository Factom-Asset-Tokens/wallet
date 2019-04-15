<template>
  <v-layout wrap>
    <v-flex xs12 sm4>
      <v-text-field
        ref="supplyInput"
        v-model="supply"
        type="number"
        label="Maximum supply"
        min="0"
        :rules="supplyRules"
        :disabled="infiniteSupply"
        :suffix="symbol"
        box
      ></v-text-field>
    </v-flex>
    <v-flex xs12 sm3 :class="{ 'pl-0': $vuetify.breakpoint.xs, 'pl-4': $vuetify.breakpoint.smAndUp }">
      <v-checkbox label="Infinite max supply" :value="infiniteSupply" @change="setInfiniteSupply"></v-checkbox>
    </v-flex>
    <v-flex xs12 sm2 offset-sm3>
      <v-text-field
        :value="symbol.toUpperCase()"
        @input="symbol = $event.trim().toUpperCase()"
        label="Symbol"
        :rules="symbolRules"
        maxlength="4"
        box
      ></v-text-field>
    </v-flex>
    <v-flex xs12>
      <v-textarea v-model.trim="metadata" label="Token metadata" box></v-textarea>
    </v-flex>
  </v-layout>
</template>

<script>
import Big from 'bignumber.js';
const SYMBOL_REGEX = /^[A-Z]{1,4}$/;

export default {
  data: () => ({
    infiniteSupply: false,
    supply: '',
    symbol: '',
    metadata: '',
    symbolRules: [v => SYMBOL_REGEX.test(v) || 'Invalid symbol']
  }),
  computed: {
    supplyRules: function() {
      return [v => this.infiniteSupply || (v && new Big(v).gt(0)) || 'Invalid supply'];
    },
    details() {
      return {
        infiniteSupply: this.infiniteSupply,
        supply: this.supply,
        symbol: this.symbol,
        metadata: this.metadata
      };
    }
  },
  methods: {
    setInfiniteSupply(v) {
      this.infiniteSupply = v;
      if (v) {
        this.supply = '';
      }
    }
  }
};
</script>
