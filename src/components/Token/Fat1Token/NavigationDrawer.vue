<template>
  <NavigationDrawer :items="items">
    <v-flex text-xs-center class="title">
      {{ tokenId }}
    </v-flex>
  </NavigationDrawer>
</template>

<script>
import NavigationDrawer from '@/components/NavigationDrawer';

export default {
  components: { NavigationDrawer },
  props: ['tokenId'],
  data() {
    return {
      items: [
        { text: 'Info' },
        { text: 'Balances', icon: 'account_balance_wallet', to: 'balances' },
        { text: 'Transaction History', icon: 'history', to: 'history' },
        { text: 'Actions' },
        { text: 'Send Tokens', icon: 'send', to: 'send' }
      ]
    };
  }
};
</script>
