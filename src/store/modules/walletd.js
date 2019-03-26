import { WalletdCli } from 'factom';
import { URL } from 'url';
import { getIntegerPort } from './common';

export default {
  namespaced: true,
  state: {
    endpoint: 'http://localhost:8089/v2',
    status: null,
    version: null,
    identitySupport: false
  },
  getters: {
    config: state => {
      try {
        const url = new URL(state.endpoint);
        return {
          host: url.hostname,
          port: getIntegerPort(url),
          protocol: url.protocol.slice(0, -1),
          path: url.pathname,
          retry: { retries: 0 }
        };
      } catch (e) {
        return;
      }
    },
    cli: (state, getters) => (getters.config ? new WalletdCli(getters.config) : undefined)
  },
  mutations: {
    updateStatus: (state, status) => (state.status = status),
    updateVersion: (state, version) => (state.version = version),
    updateEndpoint: (state, endpoint) => (state.endpoint = endpoint),
    updateIdentitySupport: (state, identitySupport) => (state.identitySupport = identitySupport)
  },
  actions: {
    async update({ commit, dispatch }, endpoint) {
      commit('updateEndpoint', endpoint);
      await dispatch('checkStatus');
    },
    async checkStatus({ commit, getters }) {
      const cli = getters.cli;
      if (cli) {
        commit('updateStatus', 'checking');
      } else {
        return commit('updateStatus', 'ko');
      }

      try {
        const { walletversion } = await cli.call('properties');
        if (walletversion) {
          commit('updateStatus', 'ok');
          commit('updateVersion', walletversion);
          commit('updateIdentitySupport', supportsIdentity(walletversion));
        } else {
          commit('updateStatus', 'ko');
          commit('updateIdentitySupport', false);
        }
      } catch (e) {
        commit('updateStatus', 'ko');
        commit('updateIdentitySupport', false);
      }
    }
  }
};

function supportsIdentity(semver) {
  const versions = semver.split('.');
  return versions[0] >= '2' && versions[1] >= '2' && versions[2] >= '15';
}
