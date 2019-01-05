import { CLIBuilder } from "fat-js";

export default {
    namespaced: true,
    state: {
        config: {
            host: 'localhost',
            port: 8078
        },
        status: null,
    },
    getters: {
        cli: state => new CLIBuilder()
            .host(state.config.host)
            .port(state.config.port)
            .build()
    },
    mutations: {
        updateStatus: (state, status) => state.status = status,
        updateConfig: (state, config) => state.config = config,
    },
    actions: {
        async update({ commit, dispatch }, config) {
            commit('updateConfig', config);
            await dispatch('checkStatus');
        },
        checkStatus({ commit, getters }) {
            const cli = getters.cli;
            commit('updateStatus', "checking");
            return cli.getDaemonProperties()
                .then(() => commit('updateStatus', "ok"))
                .catch(() => commit('updateStatus', "ko"));
        }
    }
}

