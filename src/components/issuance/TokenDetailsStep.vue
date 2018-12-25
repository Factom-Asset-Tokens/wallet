<template>
  <Fat0TokenDetailsStep v-if="type === 'fat0'"></Fat0TokenDetailsStep>
  <Fat1TokenDetailsStep v-else></Fat1TokenDetailsStep>
</template>

<script>
import Fat0TokenDetailsStep from "./Fat0TokenDetailsStep";
import Fat1TokenDetailsStep from "./Fat1TokenDetailsStep";

export default {
  components: { Fat0TokenDetailsStep, Fat1TokenDetailsStep },
  props: ["type"]
};
</script>