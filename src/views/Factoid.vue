<template>
  <v-container>
    <v-layout wrap>
      <Addresses class="section-margin-bottom"></Addresses>
      <CreateBasicTransaction class="section-margin-bottom"></CreateBasicTransaction>
      <ConvertFctToEcTransaction></ConvertFctToEcTransaction>
    </v-layout>
  </v-container>
</template>

<script>
import Addresses from "@/components/fct/Addresses";
import CreateBasicTransaction from "@/components/fct/CreateBasicTransaction";
import ConvertFctToEcTransaction from "@/components/fct/ConvertFctToEcTransaction";

export default {
  components: { Addresses, CreateBasicTransaction, ConvertFctToEcTransaction },
  data() {
    return {
      intervalId: null
    };
  },
  created() {
    const that = this;
    this.intervalId = setInterval(function() {
      that.$store.dispatch("address/fetchFctBalances");
      that.$store.dispatch("address/fetchEcBalances");
    }, 5000);
  },
  beforeDestroy() {
    clearInterval(this.intervalId);
  }
};
</script>

<style scoped>
.section-margin-bottom {
  margin-bottom: 48px;
}
</style>
