import { createFileKeyStore, openFileKeyStore } from 'factom-keystore';
import path from 'path';
const { app } = require('electron').remote;
import uuidv4 from 'uuid/v4';

const USER_DATA_PATH = app.getPath('userData');

export default {
  namespaced: true,
  state: {
    filename: '',
    store: null
  },
  mutations: {
    updateFilename: (state, filename) => (state.filename = filename),
    updateStore: (state, store) => (state.store = store)
  },
  actions: {
    async init({ state, commit }, password) {
      if (!state.filename) {
        const filename = path.join(USER_DATA_PATH, uuidv4());
        commit('updateFilename', filename);
        const store = await createFileKeyStore(filename, password);
        await Promise.all([store.generateFactoidAddress(), store.generateEntryCreditAddress()]);
        commit('updateStore', store);
      } else {
        const store = await openFileKeyStore(state.filename, password);
        commit('updateStore', store);
      }
    },
    async testPassword({ state }, password) {
      if (!state.filename) {
        throw new Error('No existing keystore file');
      }
      const store = await openFileKeyStore(state.filename, password);
      store.getSeed();
    },
    async changePassword({ state, commit }, { oldPassword, newPassword }) {
      const keystore = state.store;
      commit('updateStore', null);
      await keystore.changePassword(oldPassword, newPassword);
      commit('updateStore', keystore);
    }
  }
};
