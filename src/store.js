import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production';

import tokens from './mockup-token-data.json';

import walletd from '@/store/walletd'

export default new Vuex.Store({
    modules: {
        walletd
    },
    state: {
        settings: {
            fatd: {
                host: 'localhost',
                port: 8078
            }
        },
        trackedTokens: tokens,
    },
    getters: {

    },
    mutations: {
        updateFatdHost: (state, host) => state.settings.fatd.host = host,
        updateFatdPort: (state, port) => state.settings.fatd.port = port,
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

    },
    strict: debug
});