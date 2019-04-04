<template>
  <div>
    <v-container>
      <v-layout wrap>
        <Addresses v-if="showComponent === 'addresses'"></Addresses>
        <CreateBasicTransaction v-else-if="showComponent === 'send'"></CreateBasicTransaction>
        <ConvertFctToEc v-else-if="showComponent === 'convert'"></ConvertFctToEc>
      </v-layout>
    </v-container>
    <NavigationDrawer @show="showComponent = $event"></NavigationDrawer>
  </div>
</template>

<script>
import Addresses from '@/components/Factoid/Addresses';
import CreateBasicTransaction from '@/components/Factoid/CreateBasicTransaction';
import ConvertFctToEc from '@/components/Factoid/ConvertFctToEc';
import NavigationDrawer from '@/components/Factoid/NavigationDrawer';

export default {
  components: { Addresses, CreateBasicTransaction, ConvertFctToEc, NavigationDrawer },
  data() {
    return {
      intervalId: null,
      showComponent: 'addresses'
    };
  },
  created() {
    const that = this;
    this.intervalId = setInterval(function() {
      that.$store.dispatch('address/fetchBalances');
    }, 5000);
  },
  beforeDestroy() {
    clearInterval(this.intervalId);
  }
};
</script>
