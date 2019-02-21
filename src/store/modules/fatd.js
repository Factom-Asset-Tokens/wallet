import { CLIBuilder } from "@fat-token/fat-js";

export default {
    namespaced: true,
    state: {
        config: {
            host: 'localhost',
            port: 8078
        },
        status: null,
        version: null
    },
    getters: {
        cli: state => new CLIBuilder()
            .host(state.config.host)
            .port(state.config.port)
            .build()
    },
    mutations: {
        updateStatus: (state, status) => state.status = status,
        updateVersion: (state, version) => state.version = version,
        updateConfig: (state, config) => state.config = config,
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

