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
import Addresses from "@/components/Factoid/Addresses";
import CreateBasicTransaction from "@/components/Factoid/CreateBasicTransaction";
import ConvertFctToEcTransaction from "@/components/Factoid/ConvertFctToEcTransaction";

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
      if (that.$store.state.factomd.status === "ok") {
        that.$store.dispatch("address/fetchBalances");
      }
    }, 5000);
  },
  beforeDestroy() {
    clearInterval(this.intervalId);
  }
};
</script>

<style scoped>
.section-margin-bottom {
  margin-bottom: 36px;
}
</style>
