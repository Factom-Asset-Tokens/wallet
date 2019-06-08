<template>
  <v-layout wrap>
    <v-flex xs12 sm4 px-1>
      <v-alert :value="true" type="info" outline>
        Minimum required fee: <strong>{{ requiredFee.toFormat() }} FCT</strong></v-alert
      >
    </v-flex>
    <v-flex xs12 sm8 px-1>
      <v-alert :value="true" :type="transactionFeeAlertType" outline>
        Transaction fee: <strong>{{ transactionFee.toFormat() }} FCT</strong>
        <span v-if="!!noticeVerb">
          - {{ noticeVerb }} by <strong>{{ feeDiff.abs().toFormat() }} FCT</strong></span
        >
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
    transactionFeeAlertType() {
      if (this.feeDiff.isZero()) {
        return 'success';
      } else if (this.feeDiff.gt(0)) {
        return 'warning';
      } else {
        return 'error';
      }
    },
    noticeVerb() {
      if (this.feeDiff.isZero()) {
        return '';
      } else if (this.feeDiff.gt(0)) {
        return 'Overpaying';
      } else {
        return 'Underpaying';
      }
    }
  }
};
</script>
