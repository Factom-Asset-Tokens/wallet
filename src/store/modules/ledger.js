import 'babel-polyfill';
import Promise from 'bluebird';
import Transport from '@ledgerhq/hw-transport-node-hid-noevents';
import Fct from '@factoid.org/hw-app-fct';

export const LEDGER_STATUS = {
  UNKNOWN: -1,
  DISCONNECTED: 0,
  DEVICE_CONNECTED: 1,
  FCT_APP_LAUNCHED: 2,
  UNLOCKED: 3
};

export default {
  namespaced: true,
  state: {
    factomAppConf: null,
    productName: '',

    nextFctAddress: 0,
    nextEcAddress: 0
  },
  mutations: {
    setProductName: (state, productName) => (state.productName = productName),
    setFctAppConfig: (state, factomAppConf) => (state.factomAppConf = factomAppConf),
    setNextFctAddress: (state, nextFctAddress) => (state.nextFctAddress = nextFctAddress),
    setNextEcAddress: (state, nextEcAddress) => (state.nextEcAddress = nextEcAddress)
  },
  actions: {
    async getStatus({ commit, dispatch }) {
      try {
        const transport = await Transport.create();
        commit('setProductName', transport.deviceModel.productName);
        const fctApp = new Fct(transport);
        if (await dispatch('isFctAppOpen', fctApp)) {
          try {
            await fctApp.getAddress(`44'/131'/0'/0'/0'`);
            return LEDGER_STATUS.UNLOCKED;
          } catch (e) {
            return LEDGER_STATUS.FCT_APP_LAUNCHED;
          }
        } else {
          return LEDGER_STATUS.DEVICE_CONNECTED;
        }
      } catch (e) {
        return LEDGER_STATUS.DISCONNECTED;
      }
    },
    async isFctAppOpen({ commit }, fctApp) {
      try {
        const factomAppConf = await fctApp.getAppConfiguration();
        commit('setFctAppConfig', factomAppConf);
        return true;
      } catch (e) {
        commit('setFctAppConfig', null);
        return false;
      }
    },

    ////////////

    async fetchNextFctAddresses({ state, commit }, nb = 1) {
      try {
        const range = [];
        for (let i = state.nextFctAddress; i < state.nextFctAddress + nb; ++i) {
          range.push(i);
        }

        const transport = await Transport.create();
        const fctApp = new Fct(transport);
        const addresses = await Promise.mapSeries(range, n => fctApp.getAddress(`44'/131'/0'/0'/${n}'`));
        commit('setNextFctAddress', state.nextFctAddress + nb);
        return addresses.map(a => a.address);
      } catch (e) {
        throw new Error('Failed to fetch next FCT addresses from Ledger');
      }
    },
    async fetchNextEcAddresses({ state, commit }, nb = 1) {
      try {
        const range = [];
        for (let i = state.nextEcAddress; i < state.nextEcAddress + nb; ++i) {
          range.push(i);
        }

        const transport = await Transport.create();
        const fctApp = new Fct(transport);
        const addresses = await Promise.mapSeries(range, n => fctApp.getAddress(`44'/132'/0'/0'/${n}'`));
        commit('setNextEcAddress', state.nextEcAddress + nb);
        return addresses.map(a => a.address);
      } catch (e) {
        throw new Error('Failed to fetch next EC addresses from Ledger');
      }
    }
  }
};
