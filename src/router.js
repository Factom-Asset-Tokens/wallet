import Vue from 'vue'
import Router from 'vue-router'
import AddToken from './views/AddToken.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    { path: '/', redirect: { name: 'AddToken' } },
    {
      path: '/add-token',
      name: 'AddToken',
      component: AddToken
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import(/* webpackChunkName: "settings" */ './views/Settings.vue')
    },
    {
      path: '/token/:chainid',
      name: 'Token',
      component: () => import(/* webpackChunkName: "token" */ './views/Token.vue')
    }
  ]
})
