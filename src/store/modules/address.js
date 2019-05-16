import Big from 'bignumber.js';
const ZERO = new Big(0);

function mapNames(addresses, names) {
  return addresses.map(address => ({ address, name: names[address] }));
}

const RECENTLY_USED_HISTORY_SIZE = 4;

export default {
  namespaced: true,
  state: {
    fctRecentlyUsed: [],
    ecRecentlyUsed: [],
    ecAddresses: [],
    ecBalances: {},
    fctAddresses: [],
    fctBalances: {},
    names: {},
    preferredEcAddress: ''
  },
  getters: {
    totalFctBalance: state => Object.values(state.fctBalances).reduce((acc, val) => acc.plus(val), ZERO),
    totalEcBalance: state => Object.values(state.ecBalances).reduce((acc, val) => acc.plus(val), ZERO),
    fctAddressesWithNames: state => mapNames(state.fctAddresses, state.names),
    ecAddressesWithNames: state => mapNames(state.ecAddresses, state.names)
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
    },
    addRecentlyUsed(state, address) {
      let circularBuffer;
      if (address[0] === 'F') {
        circularBuffer = [...state.fctRecentlyUsed];
      } else {
        circularBuffer = [...state.ecRecentlyUsed];
      }

      if (!circularBuffer.includes(address)) {
        circularBuffer.unshift(address);
        if (circularBuffer.length > RECENTLY_USED_HISTORY_SIZE) {
          circularBuffer.pop();
        }
      }

      if (address[0] === 'F') {
        state.fctRecentlyUsed = circularBuffer;
      } else {
        state.ecRecentlyUsed = circularBuffer;
      }
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
      const fctAddresses = state.fctAddresses;
      const { balances } = await cli.factomdApi('multiple-fct-balances', {
        addresses: fctAddresses
      });
      const fctBalances = {};
      for (let i = 0; i < fctAddresses.length; ++i) {
        fctBalances[fctAddresses[i]] = new Big(balances[i].ack);
      }
      commit('updateFctBalances', fctBalances);
    },
    async fetchEcBalances({ state, commit, rootGetters }) {
      const cli = rootGetters['factomd/cli'];
      const ecAddresses = state.ecAddresses;
      const { balances } = await cli.factomdApi('multiple-ec-balances', {
        addresses: ecAddresses
      });
      const ecBalances = {};
      for (let i = 0; i < ecAddresses.length; ++i) {
        ecBalances[ecAddresses[i]] = new Big(balances[i].ack);
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
    },
    getPayingEcAddress({ state, rootState }) {
      if (state.preferredEcAddress && state.ecBalances[state.preferredEcAddress].gt(0)) {
        return rootState.keystore.store.getSecretKey(state.preferredEcAddress);
      }
      const found = state.ecAddresses.find(address => state.ecBalances[address].gt(0));
      if (found) {
        return rootState.keystore.store.getSecretKey(found);
      }
    }
  }
};
