function mapNames(addresses, names) {
  return addresses.map(address => ({ address, name: names[address] }));
}

export default {
  namespaced: true,
  state: {
    ecAddresses: [],
    ecBalances: {},
    fctAddresses: [],
    fctBalances: {},
    names: {},
    preferredEcAddress: ''
  },
  getters: {
    fctAddressesWithNames: state => mapNames(state.fctAddresses, state.names),
    ecAddressesWithNames: state => mapNames(state.ecAddresses, state.names),
    payingEcAddress: function(state, getters, rootState) {
      if (state.preferredEcAddress && state.ecBalances[state.preferredEcAddress]) {
        return rootState.keystore.store.getSecretKey(state.preferredEcAddress);
      }
      const found = state.ecAddresses.find(address => state.ecBalances[address]);
      if (found) {
        return rootState.keystore.store.getSecretKey(found);
      }
    }
  },
  mutations: {
    addEcAddress: (state, address) => state.ecAddresses.push(address),
    addFctAddress: (state, address) => state.fctAddresses.push(address),
    updateEcAddresses: (state, addresses) => (state.ecAddresses = addresses),
    updateEcBalances: (state, balances) => (state.ecBalances = balances),
    updateFctAddresses: (state, addresses) => (state.fctAddresses = addresses),
    updateFctBalances: (state, balances) => (state.fctBalances = balances),

    updateAddressNames(state, { address, name }) {
      const copy = { ...state.names };
      copy[address] = name;
      state.names = copy;
    },
    setPreferredEcAddress(state, ecAddress) {
      state.preferredEcAddress = ecAddress;
    }
  },
  actions: {
    async init({ rootState, dispatch }) {
      await dispatch('fetchAddresses');
      if (rootState.factomd.status === 'ok') {
        await dispatch('fetchBalances');
      } else {
        dispatch('clearBalances');
      }
    },
    clearAddresses({ commit }) {
      commit('updateEcAddresses', []);
      commit('updateFctAddresses', []);
    },
    clearBalances({ commit }) {
      commit('updateFctBalances', {});
      commit('updateEcBalances', {});
    },
    async fetchAddresses({ rootState, commit }) {
      commit('updateFctAddresses', rootState.keystore.store.getAllFactoidAddresses());
      commit('updateEcAddresses', rootState.keystore.store.getAllEntryCreditAddresses());
    },
    async fetchBalances({ dispatch }) {
      await Promise.all([dispatch('fetchFctBalances'), dispatch('fetchEcBalances')]);
    },
    async fetchFctBalances({ state, commit, rootGetters }) {
      const cli = rootGetters['factomd/cli'];
      const { balances } = await cli.factomdApi('multiple-fct-balances', {
        addresses: state.fctAddresses
      });
      const fctBalances = {};
      for (let i = 0; i < state.fctAddresses.length; ++i) {
        fctBalances[state.fctAddresses[i]] = balances[i].ack;
      }
      commit('updateFctBalances', fctBalances);
    },
    async fetchEcBalances({ state, commit, rootGetters }) {
      const cli = rootGetters['factomd/cli'];
      const { balances } = await cli.factomdApi('multiple-ec-balances', {
        addresses: state.ecAddresses
      });
      const ecBalances = {};
      for (let i = 0; i < state.ecAddresses.length; ++i) {
        ecBalances[state.ecAddresses[i]] = balances[i].ack;
      }
      commit('updateEcBalances', ecBalances);
    },
    async importAddress({ rootState, dispatch }, address) {
      await rootState.keystore.store.import(address);
      await dispatch('init');
    },
    async generateAddress({ dispatch }, type) {
      switch (type) {
        case 'factoid':
          dispatch('generateFctAddress');
          break;
        case 'ec':
          dispatch('generateEcAddress');
          break;
      }
    },
    async generateFctAddress({ rootState, commit, dispatch }) {
      const { public: fctPub } = await rootState.keystore.store.generateFactoidAddress();
      commit('addFctAddress', fctPub);
      await dispatch('fetchFctBalances');
    },
    async generateEcAddress({ rootState, commit, dispatch }) {
      const { public: ecPub } = await rootState.keystore.store.generateEntryCreditAddress();
      commit('addEcAddress', ecPub);
      await dispatch('fetchEcBalances');
    }
  }
};
