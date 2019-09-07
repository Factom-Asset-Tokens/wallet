import Vue from 'vue';
import Router from 'vue-router';
import TrackToken from './views/TrackToken.vue';
import Settings from './views/Settings.vue';
import Token from './views/Token.vue';
import IssueToken from './views/IssueToken.vue';
import CoinbaseTransaction from './views/CoinbaseTransaction.vue';
import Factoid from './views/Factoid.vue';
import Start from './views/Start.vue';
import NewWallet from './views/NewWallet.vue';
import RestoreWalletPhrase from './views/RestoreWalletPhrase.vue';
import RestoreWalletBackup from './views/RestoreWalletBackup.vue';
import LedgerModeStart from './views/LedgerModeStart.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'Start',
      component: Start
    },
    {
      path: '/new-wallet',
      name: 'NewWallet',
      component: NewWallet
    },
    {
      path: '/restore-wallet-phrase',
      name: 'RestoreWalletPhrase',
      component: RestoreWalletPhrase
    },
    {
      path: '/restore-wallet-backup',
      name: 'RestoreWalletBackup',
      component: RestoreWalletBackup
    },
    {
      path: '/fct',
      name: 'Factoid',
      component: Factoid
    },
    {
      path: '/track-token',
      name: 'TrackToken',
      component: TrackToken
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
    },
    {
      path: '/coinbase-transaction',
      name: 'CoinbaseTransaction',
      component: CoinbaseTransaction
    },
    {
      path: '/ledger-mode-start',
      name: 'LedgerModeStart',
      component: LedgerModeStart
    }
  ]
});
