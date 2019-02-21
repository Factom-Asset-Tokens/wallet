import { FactomCli } from "factom";

export default {
    namespaced: true,
    state: {
        config: {
            host: 'localhost',
            port: 8088
        },
        status: null,
        version: null
    },
    getters: {
        cli: (state, getters, rootState) => new FactomCli({
            factomd: {
                host: state.config.host,
                port: state.config.port,
                retry: { retries: 0 }
            },
            walletd: {
                host: rootState.walletd.config.host,
                port: rootState.walletd.config.port,
                retry: { retries: 0 }
            }
        })
    },
    mutations: {
        updateStatus: (state, status) => state.status = status,
        updateVersion: (state, version) => state.version = version,
        updateConfig: (state, config) => state.config = config
    },
    actions: {
        async update({ commit, dispatch }, config) {
            commit('updateConfig', config);
            await dispatch('checkStatus');
        },
        async checkStatus({ commit, getters }) {
            const cli = getters.cli;
            commit('updateStatus', "checking");

            try {
                const { factomdversion } = await cli.factomdApi('properties');
                if (factomdversion) {
                    commit('updateStatus', "ok");
                    commit('updateVersion', factomdversion);
                } else {
                    commit('updateStatus', "ko");
                }
            } catch (e) {
                commit('updateStatus', "ko");
            }
        }
    }
}

