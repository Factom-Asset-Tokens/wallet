import Vue from 'vue';
import Router from 'vue-router';
import AddToken from '@/components/AddToken';
import Settings from '@/components/Settings';
import Token from '@/components/Token';

Vue.use(Router);

export default new Router({
  routes: [
    { path: '/', redirect: '/add-token' },
    {
      path: '/add-token',
      name: 'AddToken',
      component: AddToken
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
