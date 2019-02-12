export default {
    namespaced: true,
    state: {
        tracked: {},
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

