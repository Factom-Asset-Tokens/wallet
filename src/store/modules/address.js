import Big from 'bignumber.js';
const ZERO = new Big(0);

function mapNames(addresses, names) {
  return addresses.map(address => ({ address, name: names[address] }));
}

export default {
  namespaced: true,
  state: {
    ecAddresses: [],
    ecBalances: {},
    fctAddresses: [],
    bookAddresses: [],
    fctBalances: {},
    names: {},
    preferredEcAddress: ''
  },
  getters: {
    totalFctBalance: state => Object.values(state.fctBalances).reduce((acc, val) => acc.plus(val), ZERO),
    totalEcBalance: state => Object.values(state.ecBalances).reduce((acc, val) => acc.plus(val), ZERO),
    fctAddressesWithNames: state => mapNames(state.fctAddresses, state.names),
    ecAddressesWithNames: state => mapNames(state.ecAddresses, state.names),
    bookAddressesWithNames: state => mapNames(state.bookAddresses, state.names)
  },
  mutations: {
    addEcAddress: (state, address) => state.ecAddresses.push(address),
    addFctAddress: (state, address) => state.fctAddresses.push(address),
    addAddressToBook: (state, address) => state.bookAddresses.push(address),
    removeFromAddressBook: (state, index) => state.bookAddresses.splice(index, 1),
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
    clearBalances({ commit }) {
      commit('updateFctBalances', {});
      commit('updateEcBalances', {});
    },
    async fetchAddresses({ rootState, commit, dispatch }) {
      let fctAddresses = [],
        ecAddresses = [];

      if (rootState.ledgerMode) {
        fctAddresses = await dispatch('ledger/fetchNextFctAddresses', 5, { root: true });
        ecAddresses = await dispatch('ledger/fetchNextEcAddresses', 5, { root: true });
      } else {
        fctAddresses = rootState.keystore.store.getAllFactoidAddresses();
        ecAddresses = rootState.keystore.store.getAllEntryCreditAddresses();
      }

      commit('updateFctAddresses', fctAddresses);
      commit('updateEcAddresses', ecAddresses);
    },
    async fetchBalances({ dispatch }) {
      await Promise.all([dispatch('fetchFctBalances'), dispatch('fetchEcBalances')]);
    },
    async fetchFctBalances({ state, commit, rootGetters }) {
      const cli = rootGetters['factomd/cli'];
      const fctAddresses = [...state.fctAddresses];
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
      const ecAddresses = [...state.ecAddresses];
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
      if (!rootState.ledgerMode) {
        await rootState.keystore.store.import(address);
        await dispatch('init');
      } else {
        throw new Error('Cannot import address in Ledger mode');
      }
    },
    async generateAddress({ dispatch }, type) {
      switch (type) {
        case 'factoid':
          await dispatch('generateFctAddress');
          break;
        case 'ec':
          await dispatch('generateEcAddress');
          break;
      }
    },
    async generateFctAddress({ rootState, commit, dispatch }) {
      let fctPub;
      if (rootState.ledgerMode) {
        [fctPub] = await dispatch('ledger/fetchNextFctAddresses', 1, { root: true });
      } else {
        const fctAddress = await rootState.keystore.store.generateFactoidAddress();
        fctPub = fctAddress.public;
      }

      commit('addFctAddress', fctPub);
      await dispatch('fetchFctBalances');
    },
    async generateEcAddress({ rootState, commit, dispatch }) {
      let ecPub;
      if (rootState.ledgerMode) {
        [ecPub] = await dispatch('ledger/fetchNextEcAddresses', 1, { root: true });
      } else {
        const ecAddress = await rootState.keystore.store.generateEntryCreditAddress();
        ecPub = ecAddress.public;
      }

      commit('addEcAddress', ecPub);
      await dispatch('fetchEcBalances');
    },
    async getPayingEcSecretKey({ dispatch, rootState }) {
      if (rootState.ledgerMode) {
        throw new Error('Unexpected call to getPayingEcSecretKey in ledger mode');
      }

      const address = await dispatch('getPayingEcAddress');
      if (address) {
        return rootState.keystore.store.getSecretKey(address);
      }
    },
    async getPayingEcAddress({ state, dispatch }) {
      await dispatch('fetchEcBalances');
      // If there is a preferred address and it is funded
      if (state.preferredEcAddress && state.ecBalances[state.preferredEcAddress].gt(0)) {
        return state.preferredEcAddress;
      }

      // Otherwise take any address with some funds (return undefined if there is none)
      return state.ecAddresses.find(address => state.ecBalances[address].gt(0));
    }
  }
};
