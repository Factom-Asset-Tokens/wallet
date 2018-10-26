import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/components/Home';
import Settings from '@/components/Settings';
import Token from '@/components/Token';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/settings',
      name: 'Settings',
      component: Settings
    },
    {
      path: '/token/:chainid',
      name: 'Token',
      component: Token
    }
  ]
});
