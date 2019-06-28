<template>
  <v-layout wrap>
    <v-flex xs12 sm4 px-1>
      <v-alert :value="true" type="info" outline>
        Minimum required fee: <strong>{{ requiredFee.toFormat() }} FCT</strong></v-alert
      >
    </v-flex>
    <v-flex xs12 sm8 px-1>
      <v-alert :value="type === 'ok'" type="success" outline>
        Transaction fee: <strong>{{ transactionFee.toFormat() }} FCT</strong>
      </v-alert>
      <v-alert :value="type === 'overpaying'" type="warning" outline>
        Transaction fee: <strong>{{ transactionFee.toFormat() }} FCT</strong> - Overpaying by
        <strong>{{ feeDiffText }} FCT</strong>
      </v-alert>
      <v-alert :value="type === 'underpaying'" type="error" outline>
        Transaction fee: <strong>{{ transactionFee.toFormat() }} FCT</strong> - Underpaying by
        <strong>{{ feeDiffText }} FCT</strong>
      </v-alert>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  props: ['requiredFee', 'transactionFee'],
  computed: {
    feeDiff() {
      return this.transactionFee.minus(this.requiredFee);
    },
    feeDiffText() {
      return this.feeDiff.abs().toFormat();
    },
    type() {
      if (this.feeDiff.isZero()) {
        return 'ok';
      } else if (this.feeDiff.gt(0)) {
        return 'overpaying';
      } else {
        return 'underpaying';
      }
    }
  }
};
</script>
