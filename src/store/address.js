function mapNames(addresses, names) {
    return addresses.map(address => ({ address, name: names[address] }));
}

export default {
    namespaced: true,
    state: {
        ecAddresses: [],
        ecBalances: {},
        fctAddresses: [],
        fctBalances: {},
        addressesNames: {},
        preferredEcAddress: ''
    },
    getters: {
        fctAddressesWithNames: state => mapNames(state.fctAddresses, state.addressesNames),
        ecAddressesWithNames: state => mapNames(state.ecAddresses, state.addressesNames),
        payingEcAddress: function (state) {
            if (state.preferredEcAddress && state.ecBalances[state.preferredEcAddress]) {
                return state.preferredEcAddress;
            }
            return state.ecAddresses.find(address => state.ecBalances[address]);
        }
    },
    mutations: {
        updateEcAddresses: (state, addresses) => state.ecAddresses = addresses,
        updateEcBalances: (state, balances) => state.ecBalances = balances,
        updateFctAddresses: (state, addresses) => state.fctAddresses = addresses,
        updateFctBalances: (state, balances) => state.fctBalances = balances,

        updateAddressNames(state, { address, name }) {
            const copy = { ...state.addressesNames };
            copy[address] = name;
            state.addressesNames = copy;
        },
        setPreferredEcAddress(state, ecAddress) {
            state.preferredEcAddress = ecAddress;
        }
    },
    actions: {
        async init({ rootState, dispatch }) {
            if (rootState.walletd.status === "ok") {
                await dispatch('fetchAddresses');
            }
            if (rootState.factomd.status === "ok") {
                await dispatch('fetchBalances');
            }
        },
        async fetchAddresses({ commit, rootGetters }) {
            const cli = rootGetters['walletd/cli'];
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
        async fetchBalances({ dispatch }) {
            await Promise.all([dispatch('fetchFctBalances'), dispatch('fetchEcBalances')]);
        },
        async fetchFctBalances({ state, commit, rootGetters }) {
            const cli = rootGetters['factomd/cli'];
            const { balances } = await cli.factomdApi('multiple-fct-balances', { addresses: state.fctAddresses });
            const fctBalances = {};
            for (let i = 0; i < state.fctAddresses.length; ++i) {
                fctBalances[state.fctAddresses[i]] = balances[i].ack;
            }
            commit('updateFctBalances', fctBalances);
        },
        async fetchEcBalances({ state, commit, rootGetters }) {
            const cli = rootGetters['factomd/cli'];
            const { balances } = await cli.factomdApi('multiple-ec-balances', { addresses: state.ecAddresses });
            const ecBalances = {};
            for (let i = 0; i < state.ecAddresses.length; ++i) {
                ecBalances[state.ecAddresses[i]] = balances[i].ack;
            }
            commit('updateEcBalances', ecBalances);
        },
        async importAddress({ rootGetters, dispatch }, address) {
            const cli = rootGetters['walletd/cli'];
            await cli.call('import-addresses', { "addresses": [{ "secret": address }] });
            await dispatch('init');
        }
    }
}

