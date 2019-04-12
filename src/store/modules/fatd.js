import { CLIBuilder } from '@fat-token/fat-js';
import { URL } from 'url';
import { getIntegerPort } from './common';

export default {
  namespaced: true,
  state: {
    endpoint: 'http://localhost:8078',
    status: null,
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
            .build()
        : undefined
  },
  mutations: {
    updateStatus: (state, status) => (state.status = status),
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
        commit('updateStatus', 'checking');
      } else {
        return commit('updateStatus', 'ko');
      }

      try {
        const { fatdversion } = await cli.getDaemonProperties();
        if (fatdversion) {
          commit('updateStatus', 'ok');
          commit('updateVersion', fatdversion);
          await dispatch('trackSyncingStatus');
        } else {
          commit('updateStatus', 'ko');
        }
      } catch (e) {
        commit('updateStatus', 'ko');
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
    async checkSyncStatus({ getters, commit }) {
      const cli = getters.cli;
      const status = await cli.call('get-sync-status');
      commit('updateFactomHeight', status.factomheight);
      commit('updateSyncHeight', status.syncheight);
    }
  }
};
