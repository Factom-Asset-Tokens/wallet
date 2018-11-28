import tokens from '../mockup-token-data.json';

export default {
    namespaced: true,
    state: {
        tracked: tokens,
    },
    mutations: {
        trackToken(state, token) {
            const copy = { ...state.tracked };
            copy[token.chainId] = token;
            state.tracked = copy;
        },
        untrackToken(state, tokenChainId) {
            const copy = { ...state.tracked };
            delete copy[tokenChainId];
            state.tracked = copy;
        }
    },
}

