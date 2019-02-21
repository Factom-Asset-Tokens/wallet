import { CLIBuilder } from "@fat-token/fat-js";
import { URL } from 'url';
import { getIntegerPort } from './common';

export default {
    namespaced: true,
    state: {
        endpoint: 'http://localhost:8078',
        status: null,
        version: null
    },
    getters: {
        config: state => {
            try {
                const url = new URL(state.endpoint);
                return {
                    hostname: url.hostname,
                    port: getIntegerPort(url)
                }
            } catch (e) {
                return;
            }
        },
        cli: (state, getters) => getters.config ? new CLIBuilder()
            .host(getters.config.hostname)
            .port(getters.config.port)
            .build() : undefined
    },
    mutations: {
        updateStatus: (state, status) => state.status = status,
        updateVersion: (state, version) => state.version = version,
        updateEndpoint: (state, endpoint) => state.endpoint = endpoint,
    },
    actions: {
        async update({ commit, dispatch }, endpoint) {
            commit('updateEndpoint', endpoint);
            await dispatch('checkStatus');
        },
        async checkStatus({ commit, getters }) {
            const cli = getters.cli;
            if (cli) {
                commit('updateStatus', "checking");
            } else {
                return commit('updateStatus', "ko");
            }

            try {
                const { fatdversion } = await cli.getDaemonProperties();
                if (fatdversion) {
                    commit('updateStatus', "ok");
                    commit('updateVersion', fatdversion);
                } else {
                    commit('updateStatus', "ko");
                }
            } catch (e) {
                commit('updateStatus', "ko");
            }
        }
    }
}

