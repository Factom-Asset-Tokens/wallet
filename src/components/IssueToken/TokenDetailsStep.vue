<template>
  <Fat0TokenDetailsStep v-if="type === 'fat0'" ref="fat0"></Fat0TokenDetailsStep>
  <Fat1TokenDetailsStep v-else ref="fat1"></Fat1TokenDetailsStep>
</template>

<script>
import Fat0TokenDetailsStep from './Fat0TokenDetailsStep';
import Fat1TokenDetailsStep from './Fat1TokenDetailsStep';

export default {
  components: { Fat0TokenDetailsStep, Fat1TokenDetailsStep },
  props: ['type'],
  methods: {
    getDetails() {
      if (this.type === 'fat0') {
        return this.$refs.fat0.details;
      } else {
        return this.$refs.fat1.details;
      }
    }
  }
};
</script>
