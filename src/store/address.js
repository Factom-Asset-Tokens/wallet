import { inherits } from "util";

function mapNames(addresses, names) {
    return addresses.map(address => ({ address, name: names[address] }));
}

export default {
    namespaced: true,
    state: {
        ecAddresses: [],
        fctAddresses: [],
        addressesNames: {},
        preferredEcAddress: ''
    },
    getters: {
        fctAddressesWithNames: state => mapNames(state.fctAddresses, state.addressesNames),
        ecAddressesWithNames: state => mapNames(state.ecAddresses, state.addressesNames)
    },
    mutations: {
        updateEcAddresses: (state, addresses) => state.ecAddresses = addresses,
        updateFctAddresses: (state, addresses) => state.fctAddresses = addresses,
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
        async fetchBalances({ rootGetters }) {
            // TODO
            const cli = rootGetters['walletd/cli'];

        },
        async importAddress({ rootGetters, dispatch }, address) {
            const cli = rootGetters['walletd/cli'];
            await cli.call('import-addresses', { "addresses": [{ "secret": address }] });
            await dispatch('init');
        }
    }
}

