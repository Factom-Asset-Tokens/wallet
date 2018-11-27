import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production';

import { WalletdCli } from "factom";
import tokens from './mockup-token-data.json';

export default new Vuex.Store({
    state: {
        settings: {
            fatd: {
                host: 'localhost',
                port: 8078
            },
            walletd: {
                host: 'localhost',
                port: 8089
            }
        },
        walletdStatus: null,
        trackedTokens: tokens,
        ecAddresses: [],
        fctAddresses: [],
    },
    getters: {
        //fatdCli: state => `http://${state.settings.fatd.host}:${state.settings.fatd.port}`,
        walletdCli: state => new WalletdCli({
            host: state.settings.walletd.host, port: state.settings.walletd.port, retry: {
                retries: 2,
                factor: 2,
                minTimeout: 500,
                maxTimeout: 2000
            }
        })
    },
    mutations: {
        updateWalletdStatus: (state, status) => state.walletdStatus = status,
        updateFatdHost: (state, host) => state.settings.fatd.host = host,
        updateFatdPort: (state, port) => state.settings.fatd.port = port,
        updateWalletd: (state, info) => state.settings.walletd = info,
        updateEcAddresses: (state, addresses) => state.ecAddresses = addresses,
        updateFctAddresses: (state, addresses) => state.fctAddresses = addresses,
        trackToken(state, token) {
            const copy = { ...state.trackedTokens };
            copy[token.chainId] = token;
            state.trackedTokens = copy;
        },
        untrackToken(state, tokenChainId) {
            const copy = { ...state.trackedTokens };
            delete copy[tokenChainId];
            state.trackedTokens = copy;
        }
    },
    actions: {
        async updateWalletd({ commit, dispatch }, info) {
            commit('updateWalletd', info);
            await dispatch('initWalletd');
        },
        async initWalletd({ state, dispatch }) {
            await dispatch('checkWalletdStatus');
            if (state.walletdStatus === "ok") {
                await dispatch('refreshWalletdData');
            }
        },
        checkWalletdStatus({ commit, getters }) {
            const cli = getters.walletdCli;
            commit('updateWalletdStatus', "checking");
            return cli.call('properties')
                .then(() => commit('updateWalletdStatus', "ok"))
                .catch(() => commit('updateWalletdStatus', "ko"));
        },
        async refreshWalletdData({ commit, getters }) {
            const cli = getters.walletdCli;
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
        }
    },
    strict: debug
});