import Vue from 'vue'
import Router from 'vue-router'
import AddToken from './views/AddToken.vue'
import Settings from './views/Settings.vue'
import Token from './views/Token.vue'
import IssueToken from './views/IssueToken.vue'

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
      path: '/issue-token',
      name: 'IssueToken',
      component: IssueToken
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
})
