import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

// Modules
import factomd from '@/store/modules/factomd';
import fatd from '@/store/modules/fatd';
import tokens from '@/store/modules/tokens';
import address from '@/store/modules/address';
import identity from '@/store/modules/identity';
import keystore from '@/store/modules/keystore';

// Plugins
import createPersistedState from '@/store/plugins/fat-wallet-persisted-state';
import watch from '@/store/plugins/watch';

export default new Vuex.Store({
  plugins: [createPersistedState, watch],
  modules: {
    factomd,
    fatd,
    tokens,
    address,
    identity,
    keystore
  },
  state: {
    snack: false,
    snackMessage: '',
    snackColor: ''
  },
  getters: {
    daemonsKo: state => state.fatd.status === 'ko' || state.factomd.status === 'ko',
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
      await Promise.all([dispatch('factomd/checkStatus'), dispatch('fatd/checkStatus'), dispatch('keystore/init')]);
      // Address and init modules requires keystore module to be initialized first
      await Promise.all([dispatch('address/init'), dispatch('identity/init')]);
    },
    async backup({ state }) {
      const backup = { config: {}, address: {} };
      // Daemon configs
      backup.config.factomd = state.factomd.config;
      backup.config.fatd = state.fatd.config;
      // Tracked tokens
      backup.trackedTokens = Object.values(state.tokens.tracked).map(t => t.chainId);
      // Identity chains
      backup.identities = Object.keys(state.identity.identities);
      // Addresses
      backup.address.preferredEcAddress = state.address.preferredEcAddress;
      backup.address.names = state.address.names;
      // Keystore backup
      backup.keystore = state.keystore.store.getBackup();

      return backup;
    },
    async restore() {
      // TODO
    }
  },
  strict: debug
});
