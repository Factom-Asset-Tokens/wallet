import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production';

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
                port: 8088
            }
        },
        trackedTokens: tokens
    },
    getters: {
        fatdEndPoint: state => `http://${state.settings.fatd.host}:${state.settings.fatd.port}`,
        walletdEndPoint: state => `http://${state.settings.walletd.host}:${state.settings.walletd.port}`
    },
    mutations: {
        updateFatdHost: (state, host) => state.settings.fatd.host = host,
        updateFatdPort: (state, port) => state.settings.fatd.port = port,
        updateWalletdHost: (state, host) => state.settings.walletd.host = host,
        updateWalletdPort: (state, port) => state.settings.walletd.port = port,
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
    strict: debug
});