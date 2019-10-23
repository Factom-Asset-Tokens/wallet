import { CLIBuilder } from '@fat-token/fat-js';
import { URL } from 'url';
import { getIntegerPort } from './common';

export default {
  namespaced: true,
  state: {
    endpoint: 'http://0.testnet.fat.dbgrow.com:8078',
    status: null,
    errorMessage: '',
    factomHeight: 1,
    syncHeight: 1,
    version: null,
    trackingSyncState: false
  },
  getters: {
    synced: state => state.syncHeight >= state.factomHeight - 1,
    config: state => {
      try {
        const endpoint = state.endpoint.includes('://') ? state.endpoint : `http://${state.endpoint}`;
        const url = new URL(endpoint);
        return {
          protocol: url.protocol.slice(0, -1),
          hostname: url.hostname,
          port: getIntegerPort(url)
        };
      } catch (e) {
        return;
      }
    },
    cli: (state, getters) =>
      getters.config
        ? new CLIBuilder()
            .host(getters.config.hostname)
            .port(getters.config.port)
            .protocol(getters.config.protocol)
            .build()
        : undefined
  },
  mutations: {
    updateStatus: (state, status) => (state.status = status),
    clearError: state => (state.errorMessage = ''),
    setErrorStatus: (state, errorMessage) => {
      state.status = 'ko';
      state.errorMessage = errorMessage;
    },
    updateFactomHeight: (state, factomHeight) => (state.factomHeight = factomHeight),
    updateSyncHeight: (state, syncHeight) => (state.syncHeight = syncHeight),
    updateVersion: (state, version) => (state.version = version),
    updateEndpoint: (state, endpoint) => (state.endpoint = endpoint),
    updateTrackingSyncState: (state, trackingSyncState) => (state.trackingSyncState = trackingSyncState)
  },
  actions: {
    async update({ commit, dispatch }, endpoint) {
      commit('updateEndpoint', endpoint);
      await dispatch('checkStatus');
    },
    async checkStatus({ commit, getters, dispatch }) {
      const cli = getters.cli;
      if (cli) {
        commit('clearError');
        commit('updateStatus', 'checking');
      } else {
        return commit('setErrorStatus', 'Invalid URL');
      }

      try {
        const { fatdversion } = await cli.getDaemonProperties();
        if (fatdversion) {
          commit('updateStatus', 'ok');
          commit('clearError');
          commit('updateVersion', fatdversion);
          await dispatch('trackSyncingStatus');
        } else {
          commit('setErrorStatus', 'Not a fatd endpoint');
        }
      } catch (e) {
        commit('setErrorStatus', `Connection error: ${e.message}`);
      }
    },
    async trackSyncingStatus({ state, commit, getters, dispatch }) {
      if (!state.trackingSyncState) {
        commit('updateTrackingSyncState', true);
        await dispatch('checkSyncStatus');
        const intervalId = setInterval(async () => {
          await dispatch('checkSyncStatus');
          if (getters.synced || state.status === 'ko') {
            clearInterval(intervalId);
            commit('updateTrackingSyncState', false);
          }
        }, 3000);
      }
    },
    async checkSyncStatus({ state, getters, commit }) {
      const cli = getters.cli;
      if (cli && state.status === 'ok') {
        const status = await cli.call('get-sync-status');
        commit('updateFactomHeight', status.factomheight);
        commit('updateSyncHeight', status.syncheight);
      }
    }
  }
};
