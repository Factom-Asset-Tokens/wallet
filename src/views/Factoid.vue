<template>
  <v-container>
    <v-layout wrap v-if="canManageFactoids">
      <Addresses class="section-margin-bottom"></Addresses>
      <CreateBasicTransaction class="section-margin-bottom"></CreateBasicTransaction>
      <ConvertFctToEc></ConvertFctToEc>
    </v-layout>
    <v-alert
      v-else
      value="true"
      class="title"
      type="error"
      outline
    >The configuration of factomd or walletd is incorrect. Go to the settings to fix them.</v-alert>
  </v-container>
</template>

<script>
import Addresses from "@/components/Factoid/Addresses";
import CreateBasicTransaction from "@/components/Factoid/CreateBasicTransaction";
import ConvertFctToEc from "@/components/Factoid/ConvertFctToEc";
import AvailableFeatures from "@/mixins/AvailableFeatures";

export default {
  components: { Addresses, CreateBasicTransaction, ConvertFctToEc },
  mixins: [AvailableFeatures],
  data() {
    return {
      intervalId: null
    };
  },
  computed: {
    canManageFactoids() {
      return this.availableFeatures("factomd", "walletd");
    }
  },
  created() {
    if (this.canManageFactoids) {
      const that = this;
      this.intervalId = setInterval(function() {
        that.$store.dispatch("address/fetchBalances");
      }, 5000);
    }
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
