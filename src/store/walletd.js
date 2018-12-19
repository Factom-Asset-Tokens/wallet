import { WalletdCli } from "factom";

export default {
    namespaced: true,
    state: {
        config: {
            host: 'localhost',
            port: 8089
        },
        status: null,
        ecAddresses: [],
        fctAddresses: []
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
        updateConfig: (state, config) => state.config = config,
        updateEcAddresses: (state, addresses) => state.ecAddresses = addresses,
        updateFctAddresses: (state, addresses) => state.fctAddresses = addresses,
    },
    actions: {
        async update({ commit, dispatch }, config) {
            commit('updateConfig', config);
            await dispatch('init');
        },
        async init({ state, dispatch }) {
            await dispatch('checkStatus');
            if (state.status === "ok") {
                await dispatch('fetchData');
            }
        },
        checkStatus({ commit, getters }) {
            const cli = getters.cli;
            commit('updateStatus', "checking");
            return cli.call('properties')
                .then(() => commit('updateStatus', "ok"))
                .catch(() => commit('updateStatus', "ko"));
        },
        async fetchData({ commit, getters }) {
            const cli = getters.cli;
            const data = await cli.call('all-addresses');
            const ec = [], fct = [];
            data.addresses.map(a => a.public).forEach(function (address) {
                if (address[0] === 'E') {
                    ec.push(address);
                } else {
                    fct.push(address);
                }
            });
            commit('updateEcAddresses', ec);
            commit('updateFctAddresses', fct);
        },
        async importAddress({ getters, dispatch }, address) {
            const cli = getters.cli;
            await cli.call('import-addresses', { "addresses": [{ "secret": address }] });
            await dispatch('fetchData');
        }
    }
}

