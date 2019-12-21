<template>
  <span>
    {{ integerPart }}<span v-if="decimalPart" class="decimal-part">.{{ decimalPart }}</span>
  </span>
</template>

<script>
export default {
  props: ['number'],
  computed: {
    integerPart() {
      return this.number.split('.')[0];
    },
    decimalPart() {
      const split = this.number.split('.');
      if (split.length === 2) {
        return split[1];
      }
      return null;
    }
  }
};
</script>

<style scoped>
.decimal-part {
  font-size: 22px;
}
</style>
