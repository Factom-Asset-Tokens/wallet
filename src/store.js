import Vue from 'vue';
import Vuex from 'vuex';
import Promise from 'bluebird';

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
    snackColor: '',
    displayAppSideBar: false
  },
  getters: {
    daemonsKo: state => state.fatd.status === 'ko' || state.factomd.status === 'ko',
    daemonsSyncing: (state, getters) => state.fatd.status === 'ok' && !getters['fatd/synced']
  },
  mutations: {
    showAppSideBar: state => (state.displayAppSideBar = true),
    updateSnack: (state, value) => (state.snack = value),
    snackError(state, message) {
      state.snackColor = 'error';
      state.snackMessage = message;
      state.snack = true;
    },
    snackInfo(state, message) {
      state.snackColor = 'primary';
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
    async init({ dispatch }, { password, seed, backup }) {
      if (backup) {
        await dispatch('restoreFromBackup', backup);
      }

      const keystoreBackup = backup ? backup.keystore : null;
      await Promise.all([
        dispatch('factomd/checkStatus'),
        dispatch('fatd/checkStatus'),
        dispatch('keystore/init', { password, seed, backup: keystoreBackup })
      ]);

      // Address and identity modules require keystore module to be initialized first
      await Promise.all([dispatch('address/init'), dispatch('identity/init'), dispatch('tokens/init')]);
    },
    async backup({ state }) {
      const backup = {};
      // 1. Daemon endpoints
      backup.factomd = { endpoint: state.factomd.endpoint };
      backup.fatd = { endpoint: state.fatd.endpoint };
      // 2. Tracked tokens
      backup.tokens = { tracked: Object.values(state.tokens.tracked).map(t => t.chainId) };
      // 3. Identity chains
      backup.identity = { chainIds: Object.keys(state.identity.identities) };
      // 4. Addresses
      backup.address = { preferredEcAddress: state.address.preferredEcAddress, names: state.address.names };
      // 5. Keystore backup
      backup.keystore = state.keystore.store.getBackup();

      return backup;
    },
    async restoreFromBackup({ commit, dispatch }, backup) {
      // 1. Daemon endpoints
      if (backup.factomd && backup.factomd.endpoint) {
        commit('factomd/updateEndpoint', backup.factomd.endpoint);
      }
      if (backup.fatd && backup.fatd.endpoint) {
        commit('fatd/updateEndpoint', backup.fatd.endpoint);
      }

      // 2. Tracked tokens
      if (backup.tokens && Array.isArray(backup.tokens.tracked)) {
        await Promise.map(backup.tokens.tracked, chainId => dispatch('tokens/track', chainId));
      }

      // 3. Identity chains
      if (backup.identity && Array.isArray(backup.identity.chainIds)) {
        backup.identity.chainIds.forEach(chainId => {
          const emptyIdentity = {};
          emptyIdentity[chainId] = {};
          commit('identity/addIdentity', emptyIdentity);
        });
      }

      // 4. Addresses
      if (backup.address) {
        commit('address/setPreferredEcAddress', backup.address.preferredEcAddress);
        if (backup.address.names) {
          const names = backup.address.names;
          Object.keys(names).forEach(address =>
            commit('address/updateAddressNames', { address, name: names[address] })
          );
        }
      }

      // 5. keystore is restored by 'keystore/init' action
    }
  },
  strict: debug
});
