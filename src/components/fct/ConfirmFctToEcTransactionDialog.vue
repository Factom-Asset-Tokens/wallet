<template>
  <v-dialog v-model="display" max-width="800px" @keydown.esc="close" @keydown.enter="confirm">
    <v-card>
      <v-card-title class="headline primary white--text" primary-title>Confirm transaction</v-card-title>
      <v-card-text>
        <v-layout wrap>
          <v-flex xs12 text-xs-center class="subheading" my-2>Converting</v-flex>
          <v-flex xs12 text-xs-center class="title secondary--text" mt-2>{{fctCost}} FCT</v-flex>
          <v-flex xs12 text-xs-center class="subheading" my-2>to</v-flex>
          <v-flex xs12 text-xs-center class="title secondary--text" my-2>{{ecAmountText}} EC</v-flex>
                    <v-flex xs12 text-xs-center class="subheading" my-2>sent to</v-flex>
          <v-flex xs12 text-xs-center class="title secondary--text" my-2>{{address}}</v-flex>
        </v-layout>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" flat outline @click="close">Cancel</v-btn>
        <v-btn color="primary" @click="confirm">Confirm</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: ["ecAmount", "address", "fctCost"],
  data() {
    return {
      display: false
    };
  },
  computed: {
    ecAmountText() {
      return typeof this.ecAmount === "number"
        ? this.ecAmount.toLocaleString()
        : "";
    },
    fctCostText() {
      return typeof this.fctCost === "number"
        ? this.fctCost.toLocaleString(undefined, {
            maximumFractionDigits: 8
          })
        : "";
    }
  },
  methods: {
    show() {
      this.display = true;
    },
    close() {
      this.display = false;
    },
    confirm() {
      this.$emit("confirmed");
      this.close();
    }
  }
};
</script>