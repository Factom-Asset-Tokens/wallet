import Promise from 'bluebird';
const electron = require('electron').remote;
import path from 'path';
import { app } from 'factom-identity-lib';
import fs from 'fs';
import { promisify } from 'util';
const writeFile = promisify(fs.writeFile);
const { FactomIdentityManager } = app;

const CACHE_FILE_PATH = path.join(electron.app.getPath('appData'), 'fat-wallet', 'identity-cache.json');

const save = data => writeFile(CACHE_FILE_PATH, JSON.stringify(data));

export default {
  namespaced: true,
  state: {
    identities: {},
    identityKeysInWallet: new Set()
  },
  getters: {
    manager: function(state, getters, rootState, rootGetters) {
      const config = {
        factomd: rootGetters['factomd/config']
      };
      let initialCacheData;
      try {
        initialCacheData = JSON.parse(fs.readFileSync(CACHE_FILE_PATH, 'utf8'));
      } catch (e) {
        initialCacheData = null;
      }

      return new FactomIdentityManager(config, {
        save,
        initialCacheData
      });
    }
  },
  mutations: {
    updateIdentities: (state, identities) => (state.identities = identities),
    updateIdentityKeysInWallet: (state, keysInWallet) => (state.identityKeysInWallet = new Set(keysInWallet)),
    addIdentity: (state, identity) => (state.identities = Object.assign(identity, state.identities)),
    unlinkIdentity(state, identity) {
      const copy = { ...state.identities };
      delete copy[identity];
      state.identities = copy;
    }
  },
  actions: {
    async init({ dispatch }) {
      await dispatch('fetchIdentityKeysFromKeyStore');
      await dispatch('refreshIdentities');
    },
    async fetchIdentityKeysFromKeyStore({ commit, rootState }) {
      const identityKeys = rootState.keystore.store.getAllIdentityKeys();
      commit('updateIdentityKeysInWallet', identityKeys);
    },
    async refreshIdentities({ state, getters, commit }) {
      const manager = getters.manager;

      const identities = {};
      await Promise.all(
        Object.keys(state.identities).map(chainId =>
          manager
            .getActivePublicIdentityKeys(chainId)
            .then(keys => (identities[chainId] = keys))
            .catch(e => {
              console.error(e.message);
              identities[chainId] = [];
            })
        )
      );

      commit('updateIdentities', identities);
    },
    async importIdentityKeys({ rootState, dispatch }, idKeys) {
      if (idKeys.length > 0) {
        const keystore = rootState.keystore.store;
        await Promise.map(idKeys, key => keystore.import(key), { concurrency: 1 });
        await dispatch('fetchIdentityKeysFromKeyStore');
      }
    }
  }
};
