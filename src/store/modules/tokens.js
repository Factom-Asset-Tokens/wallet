export default {
    namespaced: true,
    state: {
        tracked: {},
        clis: {}
    },
    mutations: {
        addToken(state, token) {
            const copy = { ...state.tracked };
            copy[token.chainId] = token;
            state.tracked = copy;
        },
        removeToken(state, tokenChainId) {
            const copy = { ...state.tracked };
            delete copy[tokenChainId];
            state.tracked = copy;
        },
        addCli(state, cli) {
            const copy = { ...state.clis };
            copy[cli.getTokenChainId()] = cli;
            state.clis = copy;
        },
        removeCli(state, tokenChainId) {
            const copy = { ...state.clis };
            delete copy[tokenChainId];
            state.clis = copy;
        },
    },
    actions: {
        async initializeTokenClis({ state, commit, rootGetters }) {
            const cli = rootGetters["fatd/cli"];

            return Promise.all(Object.values(state.tracked).map(async function(token) {
                const tokenCli = await cli.getTokenCLI(token.chainId, token.type);
                commit('addCli', tokenCli);
            }));
        },
        track({ commit }, { token, cli }) {
            commit('addCli', cli);
            commit('addToken', token);
        },
        untrack({commit}, tokenChainId) {
            commit('removeToken', tokenChainId);
            commit('removeCli', tokenChainId);
        }
    }
}

