<template>
  <div>
    <v-container>
      <Addresses v-if="view === 'addresses'"></Addresses>
      <TransactionHistory v-if="view === 'history'"></TransactionHistory>
      <CreateBasicTransaction v-else-if="view === 'send'"></CreateBasicTransaction>
      <CreateAdvancedTransaction v-else-if="view === 'send-advanced'"></CreateAdvancedTransaction>
      <ConvertFctToEc v-else-if="view === 'convert'"></ConvertFctToEc>
    </v-container>
    <NavigationDrawer></NavigationDrawer>
  </div>
</template>

<script>
import Addresses from '@/components/Factoid/Addresses';
import CreateBasicTransaction from '@/components/Factoid/CreateBasicTransaction';
import CreateAdvancedTransaction from '@/components/Factoid/CreateAdvancedTransaction';
import ConvertFctToEc from '@/components/Factoid/ConvertFctToEc';
import TransactionHistory from '@/components/Factoid/TransactionHistory';
import NavigationDrawer from '@/components/Factoid/NavigationDrawer';

export default {
  components: {
    Addresses,
    CreateBasicTransaction,
    CreateAdvancedTransaction,
    ConvertFctToEc,
    TransactionHistory,
    NavigationDrawer
  },
  data() {
    return {
      intervalId: null
    };
  },
  computed: {
    view() {
      return this.$route.query.view;
    }
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
