import { WalletdCli } from "factom";

export default {
    namespaced: true,
    state: {
        config: {
            host: 'localhost',
            port: 8089
        },
        status: null,
        version: null
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
                const { walletversion } = await cli.call('properties');
                if (walletversion) {
                    commit('updateStatus', "ok");
                    commit('updateVersion', walletversion);
                } else {
                    commit('updateStatus', "ko");
                }
            } catch (e) {
                commit('updateStatus', "ko");
            }
        }
    }
}

