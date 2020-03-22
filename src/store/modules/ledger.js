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
    // The legacy derivation path (v1.0.2 and prior) was using hardened keys for all levels,
    // which was not compatible with MFW.
    legacyDerivation: false,
    nextFctAddress: 0,
    nextEcAddress: 0
  },
  mutations: {
    setLegacyDerivation: (state, b) => (state.legacyDerivation = b),
    setProductName: (state, productName) => (state.productName = productName),
    setFctAppConfig: (state, factomAppConf) => (state.factomAppConf = factomAppConf),
    setNextFctAddress: (state, nextFctAddress) => (state.nextFctAddress = nextFctAddress),
    setNextEcAddress: (state, nextEcAddress) => (state.nextEcAddress = nextEcAddress)
  },
  actions: {
    async getStatus({ state, commit, dispatch }) {
      let transport;
      try {
        transport = await Transport.create();
        if (!state.productName) {
          const info = transport.device.getDeviceInfo();
          commit('setProductName', `${info.manufacturer} ${info.product}`);
        }

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
        commit('setFctAppConfig', null);
        return LEDGER_STATUS.DISCONNECTED;
      } finally {
        if (transport) {
          transport.close();
        }
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

    async signTransactionForInput({ state, rootState }, { unsignedTX, inputIndex }) {
      const addresses = [...rootState.address.fctAddresses];
      const inputAddress = unsignedTX.inputs[inputIndex].address;
      const index = addresses.findIndex(a => a === inputAddress);
      const path = getFctPath(state, index);

      const txHex = unsignedTX.marshalBinarySig.toString('hex');

      let transport;
      try {
        transport = await Transport.create();
        const fctApp = new Fct(transport);
        const signed = await fctApp.signTransaction(path, txHex);

        return {
          rcd: signed.r,
          signature: signed.s
        };
      } catch (e) {
        if (e.statusCode === 27013) {
          throw new Error('Transaction declined by the user.');
        } else {
          throw new Error(`Failed to sign transaction with Ledger. Error code: ${e.statusCode}`);
        }
      } finally {
        if (transport) {
          transport.close();
        }
      }
    },

    async signFatTransactionForInput({ state, rootState }, { unsignedTx, type, inputAddress }) {
      const addresses = [...rootState.address.fctAddresses];
      const pathIndex = addresses.findIndex(a => a === inputAddress);
      const path = getFctPath(state, pathIndex);

      let transport;
      try {
        transport = await Transport.create();
        const fctApp = new Fct(transport);
        const inputIndex = Object.keys(unsignedTx.getInputs()).findIndex(a => {
          return a === inputAddress;
        });

        const signed = await fctApp.signFatTransaction(path, type, unsignedTx.getMarshalDataSig(inputIndex));

        return signed;
      } catch (e) {
        if (e.statusCode === 27013) {
          throw new Error('Transaction declined by the user.');
        } else if (e.statusCode === 27264) {
          throw new Error('Ledger error. Transaction metadata likely too big for Ledger signing.');
        } else {
          throw new Error(`Failed to sign transaction with Ledger. Error code: ${e.statusCode}`);
        }
      } finally {
        if (transport) {
          transport.close();
        }
      }
    },
    async signEntry({ state, rootState }, { entryDataToSign, ecPublicAddress }) {
      const addresses = [...rootState.address.ecAddresses];
      const pathIndex = addresses.findIndex(a => a === ecPublicAddress);
      const path = getEcPath(state, pathIndex);

      let transport;
      try {
        transport = await Transport.create();
        const fctApp = new Fct(transport);
        const signed = await fctApp.signCommit(path, entryDataToSign.toString('hex'), false);

        return signed.s;
      } catch (e) {
        if (e.statusCode === 27013) {
          throw new Error('Transaction declined by the user.');
        } else {
          throw new Error(`Failed to sign transaction with Ledger. Error code: ${e.statusCode}`);
        }
      } finally {
        if (transport) {
          transport.close();
        }
      }
    },
    async fetchNextFctAddresses({ state, commit }, nb = 1) {
      const range = [];
      for (let i = state.nextFctAddress; i < state.nextFctAddress + nb; ++i) {
        range.push(i);
      }

      let transport;
      try {
        transport = await Transport.create();
        const fctApp = new Fct(transport);
        const addresses = await Promise.mapSeries(range, n => fctApp.getAddress(getFctPath(state, n)));

        commit('setNextFctAddress', state.nextFctAddress + nb);

        return addresses.map(a => a.address);
      } catch (e) {
        throw new Error('Failed to fetch next FCT addresses from Ledger: ' + e.message);
      } finally {
        if (transport) {
          transport.close();
        }
      }
    },
    async fetchNextEcAddresses({ state, commit }, nb = 1) {
      const range = [];
      for (let i = state.nextEcAddress; i < state.nextEcAddress + nb; ++i) {
        range.push(i);
      }

      let transport;
      try {
        transport = await Transport.create();
        const fctApp = new Fct(transport);
        const addresses = await Promise.mapSeries(range, n => fctApp.getAddress(getEcPath(state, n)));
        commit('setNextEcAddress', state.nextEcAddress + nb);

        return addresses.map(a => a.address);
      } catch (e) {
        throw new Error('Failed to fetch next EC addresses from Ledger: ' + e.message);
      } finally {
        if (transport) {
          transport.close();
        }
      }
    }
  }
};

function getFctPath(state, index) {
  return state.legacyDerivation ? `44'/131'/0'/0'/${index}'` : `44'/131'/0'/0/${index}`;
}

function getEcPath(state, index) {
  return state.legacyDerivation ? `44'/132'/0'/0'/${index}'` : `44'/132'/0'/0/${index}`;
}
