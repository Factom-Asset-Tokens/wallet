<template>
  <v-flex>
    <h1>Send tokens</h1>
    <v-layout row wrap>
      <v-flex xs12>
        <v-card>
          <v-toolbar>
            <v-toolbar-title>Inputs: {{totalInputs}} {{symbol}}</v-toolbar-title>

            <v-spacer></v-spacer>

            <v-toolbar-items>
              <v-btn flat @click="add('inputs')">Add</v-btn>
            </v-toolbar-items>
          </v-toolbar>

          <v-list two-line>
            <template v-for="(input, index) in inputs">
              <v-list-tile :key="input.address">
                <v-select
                  class="solo-padding"
                  :items="availableAddresses"
                  label="Address"
                  solo
                  v-model="input.address"
                  dense
                ></v-select>
                <v-spacer></v-spacer>
                <v-text-field
                  v-if="input.address"
                  v-model.number="input.amount"
                  type="number"
                  min="0"
                  label="Amount"
                  required
                ></v-text-field>
              </v-list-tile>
              <v-divider :key="index" v-if="index !== inputs.length - 1"></v-divider>
            </template>
          </v-list>
        </v-card>
      </v-flex>
      <v-flex xs12>
        <v-card>
          <v-toolbar>
            <v-toolbar-title>Outputs: {{totalOutputs}} {{symbol}}</v-toolbar-title>

            <v-spacer></v-spacer>

            <v-toolbar-items>
              <v-btn flat @click="add('outputs')">Add</v-btn>
            </v-toolbar-items>
          </v-toolbar>

          <v-list two-line>
            <template v-for="(output, index) in outputs">
              <v-list-tile :key="output.address">
                <v-text-field
                  class="solo-padding"
                  label="Address"
                  v-model="output.address"
                  size="50"
                  solo
                  required
                ></v-text-field>
                <v-spacer></v-spacer>
                <v-text-field
                  v-model.number="output.amount"
                  type="number"
                  min="0"
                  label="Amount"
                  required
                ></v-text-field>
              </v-list-tile>
              <v-divider :key="index" v-if="index !== outputs.length - 1"></v-divider>
            </template>
          </v-list>
        </v-card>
      </v-flex>
    </v-layout>
    <v-layout row>
      <v-spacer></v-spacer>
      <v-btn>Send</v-btn>
    </v-layout>
  </v-flex>
</template>

<script>
export default {
  data() {
    return {
      inputs: [{ address: null, amount: 0 }],
      outputs: [{ address: null, amount: 0 }]
    };
  },
  props: ["balances", "symbol"],
  computed: {
    availableAddresses() {
      const that = this;
      return this.balances.map(b => ({
        value: b.address,
        text: `${b.address} - ${b.balance} ${that.symbol}`
      }));
    },
    totalInputs() {
      return this.inputs
        .map(o => o.amount)
        .filter(a => typeof a === "number")
        .reduce((a, b) => a + b, 0);
    },
    totalOutputs() {
      return this.outputs
        .map(o => o.amount)
        .filter(a => typeof a === "number")
        .reduce((a, b) => a + b, 0);
    }
  },
  methods: {
    add: function(type) {
      this[type].push({ address: null, amount: 0 });
    }
  }
};
</script>

<style scoped>
.solo-padding {
  padding-top: 12px;
}
</style>
