// TODO: replace by fatd-js client
import axios from "axios";

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
        cli: state => axios.create({ baseURL: `http://${state.config.host}:${state.config.port}/v0` })
    },
    mutations: {
        updateStatus: (state, status) => state.status = status,
        updateConfig: (state, config) => state.config = config,
    },
    actions: {
        async update({ commit, dispatch }, config) {
            commit('updateConfig', config);
            await dispatch('init');
        },
        async init({ dispatch }) {
            await dispatch('checkStatus');
        },
        checkStatus({ commit, getters }) {
            const cli = getters.cli;
            commit('updateStatus', "checking");
            return cli.post('', {
                jsonrpc: "2.0",
                method: "get-stats",
                params: {
                    "chain-id":
                        "8eaed885426782315ac89e8c3688a539af6d2c1d5ee27372802e931877b8d325"
                },
                id: "5"
            })
                .then(() => commit('updateStatus', "ok"))
                .catch(() => commit('updateStatus', "ko"));
        }
    }
}

