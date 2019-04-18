import { createFileKeyStore, openFileKeyStore } from 'factom-keystore';
import path from 'path';
const { app } = require('electron').remote;
import uuidv4 from 'uuid/v4';

const USER_DATA_PATH = app.getPath('userData');
// TODO: implement user password at next iteration
const PASSWORD = 'THE_PASSWORD';

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
    async init({ state, commit }) {
      if (!state.filename) {
        const filename = path.join(USER_DATA_PATH, uuidv4());
        commit('updateFilename', filename);
        const store = await createFileKeyStore(filename, PASSWORD);
        await Promise.all([store.generateFactoidAddress(), store.generateEntryCreditAddress()]);
        commit('updateStore', store);
      } else {
        const store = await openFileKeyStore(state.filename, PASSWORD);
        commit('updateStore', store);
      }
    }
  }
};
