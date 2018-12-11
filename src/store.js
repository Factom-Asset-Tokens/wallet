import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production';

import walletd from '@/store/walletd'
import fatd from '@/store/fatd'
import tokens from '@/store/tokens'

function mapNames(addresses, names) {
    return addresses.map(address => ({ address, name: names[address] }));
}

export default new Vuex.Store({
    modules: {
        walletd,
        fatd,
        tokens
    },
    state: {
        addressesNames: {},
        preferredEcAddress: ''
    },
    getters: {
        daemonsOk: state => state.fatd.status === 'ok' && state.walletd.status === 'ok',
        fctAddressesWithNames: state => mapNames(state.walletd.fctAddresses, state.addressesNames),
        ecAddressesWithNames: state => mapNames(state.walletd.ecAddresses, state.addressesNames)
    },
    mutations: {
        updateAddressNames(state, { address, name }) {
            const copy = { ...state.addressesNames };
            copy[address] = name;
            state.addressesNames = copy;
        },
        setPreferredEcAddress(state, ecAddress) {
            state.preferredEcAddress = ecAddress;
        }
    },
    strict: debug
});