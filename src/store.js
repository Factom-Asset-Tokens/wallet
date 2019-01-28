import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production';

import factomd from '@/store/factomd'
import walletd from '@/store/walletd'
import fatd from '@/store/fatd'
import tokens from '@/store/tokens'
import address from '@/store/address'
import identity from '@/store/identity'

export default new Vuex.Store({
    modules: {
        factomd,
        walletd,
        fatd,
        tokens,
        address,
        identity
    },
    state: {
        snack: false,
        snackMessage: "",
        snackColor: ""
    },
    getters: {
        daemonsKo: state => state.fatd.status === 'ko' || state.walletd.status === 'ko' || state.factomd.status === 'ko'
    },
    mutations: {
        updateSnack: (state, value) => state.snack = value,
        snackError(state, message) {
            state.snackColor = "error";
            state.snackMessage = message;
            state.snack = true;
        },
        snackSuccess(state, message) {
            state.snackColor = "success";
            state.snackMessage = message;
            state.snack = true;
        }
    },
    actions: {
        async init({ dispatch }) {
            await Promise.all([
                dispatch('walletd/checkStatus'),
                dispatch('factomd/checkStatus'),
                dispatch('fatd/checkStatus')]);
            await Promise.all([dispatch('address/init'), dispatch('identity/init')]);
        },
        async backup({ state, getters }) {
            const backup = { config: {}, address: {} };
            // Daemon configs
            backup.config.factomd = state.factomd.config;
            backup.config.fatd = state.fatd.config;
            backup.config.walletd = state.walletd.config;
            // Tracked tokens
            backup.trackedTokens = Object.values(state.tokens.tracked).map(t => t.chainId);
            // Identity chains
            backup.identities = Object.keys(state.identity.identities);
            // Addresses
            backup.address.preferredEcAddress = state.address.preferredEcAddress;
            backup.address.names = state.address.names;

            // Walletd backup
            const walletd = getters['walletd/cli'];
            const walletdBackup = await walletd.call("wallet-backup");
            backup.walletdBackup = walletdBackup;

            return backup;
        },
        async restore() {
            // TODO
        }
    },
    strict: debug
});