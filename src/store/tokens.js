import tokens from '../mockup-token-data.json';

export default {
    namespaced: true,
    state: {
        tracked: tokens,
    },
    mutations: {
        track(state, token) {
            const copy = { ...state.tracked };
            copy[token.chainId] = token;
            state.tracked = copy;
        },
        untrack(state, tokenChainId) {
            const copy = { ...state.tracked };
            delete copy[tokenChainId];
            state.tracked = copy;
        }
    },
}

