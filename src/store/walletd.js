import { WalletdCli } from "factom";

export default {
    namespaced: true,
    state: {
        config: {
            host: 'localhost',
            port: 8089
        },
        status: null
    },
    getters: {
        cli: state => new WalletdCli({
            host: state.config.host,
            port: state.config.port,
            retry: { retries: 0 }
        })
    },
    mutations: {
        updateStatus: (state, status) => state.status = status,
        updateConfig: (state, config) => state.config = config
    },
    actions: {
        async update({ commit, dispatch }, config) {
            commit('updateConfig', config);
            await dispatch('checkStatus');
        },
        checkStatus({ commit, getters }) {
            const cli = getters.cli;
            commit('updateStatus', "checking");
            return cli.call('properties')
                .then(r => r.walletversion ? commit('updateStatus', "ok") : commit('updateStatus', "ko"))
                .catch(() => commit('updateStatus', "ko"));
        }
    }
}

