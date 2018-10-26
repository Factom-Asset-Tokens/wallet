import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
    state: {
        settings: {
            fatd: {
                host: 'localhost',
                port: 8078
            }
        },
        trackedTokens: {
            'f76248f405935e79c7b8a14a68f42fc32b7e5d76240767544494dbe7cb2b90aa': {
                tokenId: 'coffee-coin',
                issuer: '6d94c74167fc0bf28dcb2b233ad930f1686404340ddc860f0999f68ceb3c5d66',
                chainId: 'f76248f405935e79c7b8a14a68f42fc32b7e5d76240767544494dbe7cb2b90aa',
                iconSrc: 'https://png.icons8.com/color/80/5ECCDD/java-coffee-bean-logo.png',
                displayName: 'Coffee Coin'
            },
            '6d94c74167fc0bf28dcb2b233ad930f1686404340ddc860f0999f68ceb3c5d66': {
                tokenId: 'science-coin',
                issuer: '6d94c74167fc0bf28dcb2b233ad930f1686404340ddc860f0999f68ceb3c5d66',
                chainId: '6d94c74167fc0bf28dcb2b233ad930f1686404340ddc860f0999f68ceb3c5d66',
                iconSrc: 'https://png.icons8.com/dusk/50/000000/physics.png',
                displayName: 'Science Coin'
            }
        }
    },
    getters: {
        fatdEndPoint: state => `http://${state.settings.fatd.host}:${state.settings.fatd.port}`
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
    strict: debug
});