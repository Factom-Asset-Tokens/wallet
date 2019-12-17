import { FactomCli } from 'factom';
import { URL } from 'url';
import { getIntegerPort } from './common';

export default {
  namespaced: true,
  state: {
    endpoint: 'https://api.factomd.net/v2',
    status: null,
    errorMessage: '',
    version: null
  },
  getters: {
    config: state => {
      try {
        const endpoint = state.endpoint.includes('://') ? state.endpoint : `http://${state.endpoint}`;
        const url = new URL(endpoint);
        return {
          host: url.hostname,
          port: getIntegerPort(url),
          protocol: url.protocol.slice(0, -1),
          path: url.pathname,
          timeout: 30000,
          retry: { retries: 0 }
        };
      } catch (e) {
        return;
      }
    },
    cli: (state, getters) => {
      return getters.config ? new FactomCli(getters.config) : undefined;
    }
  },
  mutations: {
    updateStatus: (state, status) => (state.status = status),
    clearError: state => (state.errorMessage = ''),
    setErrorStatus: (state, errorMessage) => {
      state.status = 'ko';
      state.errorMessage = errorMessage;
    },
    updateVersion: (state, version) => (state.version = version),
    updateEndpoint: (state, endpoint) => (state.endpoint = endpoint)
  },
  actions: {
    async update({ commit, dispatch }, endpoint) {
      commit('updateEndpoint', endpoint);
      await dispatch('checkStatus');
    },
    async checkStatus({ commit, getters }) {
      const cli = getters.cli;
      if (cli) {
        commit('clearError');
        commit('updateStatus', 'checking');
      } else {
        return commit('setErrorStatus', 'Invalid URL');
      }

      try {
        const { factomdversion } = await cli.factomdApi('properties', null, { timeout: 5000 });
        if (factomdversion) {
          commit('updateStatus', 'ok');
          commit('clearError');
          commit('updateVersion', factomdversion);
        } else {
          commit('setErrorStatus', 'Not a factomd endpoint');
        }
      } catch (e) {
        commit('setErrorStatus', `Connection error: ${e.message}`);
      }
    }
  }
};
