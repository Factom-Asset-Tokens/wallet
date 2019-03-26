import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

// Modules
import factomd from '@/store/modules/factomd';
import walletd from '@/store/modules/walletd';
import fatd from '@/store/modules/fatd';
import tokens from '@/store/modules/tokens';
import address from '@/store/modules/address';
import identity from '@/store/modules/identity';

// Plugins
import createPersistedState from '@/store/plugins/fat-wallet-persisted-state';
import watch from '@/store/plugins/watch';

export default new Vuex.Store({
  plugins: [createPersistedState, watch],
  modules: {
    factomd,
    walletd,
    fatd,
    tokens,
    address,
    identity
  },
  state: {
    snack: false,
    snackMessage: '',
    snackColor: ''
  },
  getters: {
    daemonsKo: state => state.fatd.status === 'ko' || state.walletd.status === 'ko' || state.factomd.status === 'ko',
    daemonsSyncing: (state, getters) => state.fatd.status === 'ok' && !getters['fatd/synced']
  },
  mutations: {
    updateSnack: (state, value) => (state.snack = value),
    snackError(state, message) {
      state.snackColor = 'error';
      state.snackMessage = message;
      state.snack = true;
    },
    snackInfo(state, message) {
      state.snackColor = 'info';
      state.snackMessage = message;
      state.snack = true;
    },
    snackSuccess(state, message) {
      state.snackColor = 'success';
      state.snackMessage = message;
      state.snack = true;
    }
  },
  actions: {
    async init({ dispatch }) {
      await Promise.all([
        dispatch('walletd/checkStatus'),
        dispatch('factomd/checkStatus'),
        dispatch('fatd/checkStatus')
      ]);
    },
    async backup({ state, getters }) {
      const backup = { config: {}, address: {} };
      // Daemon configs
      backup.config.factomd = state.factomd.config;
      backup.config.fatd = state.fatd.config;
      backup.config.walletd = state.walletd.config;
      // Tracked tokens
      backup.trackedTokens = Object.values(state.tokens.tracked).map(t => t.chainId);
      // Identity chains
      backup.identities = Object.keys(state.identity.identities);
      // Addresses
      backup.address.preferredEcAddress = state.address.preferredEcAddress;
      backup.address.names = state.address.names;

      // Walletd backup
      const walletd = getters['walletd/cli'];
      const walletdBackup = await walletd.call('wallet-backup');
      backup.walletdBackup = walletdBackup;

      return backup;
    },
    async restore() {
      // TODO
    }
  },
  strict: debug
});
