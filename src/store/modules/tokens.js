import Promise from 'bluebird';
import getBalances from './tokens/get-balances';

export default {
  namespaced: true,
  state: {
    tracked: {},
    clis: {},
    balances: {}
  },
  getters: {
    balancesOf(state) {
      return chainId => (state.balances[chainId] ? state.balances[chainId] : {});
    }
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
      copy[cli.getChainId()] = cli;
      state.clis = copy;
    },
    removeCli(state, tokenChainId) {
      const copy = { ...state.clis };
      delete copy[tokenChainId];
      state.clis = copy;
    },
    updateBalances(state, { tokenChainId, balances }) {
      const copy = { ...state.balances };
      copy[tokenChainId] = balances;
      state.balances = copy;
    }
  },
  actions: {
    async init({ state, dispatch, rootState }) {
      if (rootState.fatd.status === 'ok') {
        const chainIds = Object.keys(state.tracked);
        return Promise.map(chainIds, chainId => dispatch('fetchBalances', chainId));
      }
    },
    async initializeTokenClis({ state, commit, rootGetters }) {
      const cli = rootGetters['fatd/cli'];

      return Promise.all(
        Object.values(state.tracked).map(async function(token) {
          const tokenCli = await cli.getTokenCLI(token.chainId, token.type);
          commit('addCli', tokenCli);
        })
      );
    },
    async track({ commit, rootGetters }, tokenChainId) {
      const cli = rootGetters['fatd/cli'];
      const tokenCli = await cli.getTokenCLI(tokenChainId);
      const issuance = await tokenCli.getIssuance();

      const token = {
        chainId: issuance.getChainId(),
        issuer: issuance.getIssuerChainId(),
        tokenId: issuance.getTokenId(),
        entryHash: issuance.getEntryhash(),
        timestamp: issuance.getTimestamp(),
        type: issuance.getType(),
        symbol: issuance.getSymbol(),
        supply: issuance.getSupply(),
        metadata: issuance.getMetadata()
      };

      commit('addCli', tokenCli);
      commit('addToken', token);
    },
    untrack({ commit }, tokenChainId) {
      commit('removeToken', tokenChainId);
      commit('removeCli', tokenChainId);
    },
    async fetchBalances({ state, commit, rootState }, tokenChainId) {
      const cli = state.clis[tokenChainId];
      const addresses = rootState.address.fctAddresses;

      const balances = await getBalances(cli, addresses);

      commit('updateBalances', { tokenChainId, balances });
    }
  }
};
