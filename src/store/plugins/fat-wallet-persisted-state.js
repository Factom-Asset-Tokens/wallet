import Store from 'electron-store';
import createPersistedState from './persisted-state';

const appStore = new Store({ name: 'user-config.v1' });

export default createPersistedState({
  storage: appStore,
  whitelist: [
    'address/updateAddressNames',
    'address/setPreferredEcAddress',
    'address/addRecentlyUsed',
    'fatd/updateEndpoint',
    'factomd/updateEndpoint',
    'tokens/addToken',
    'tokens/removeToken',
    'identity/updateIdentities',
    'identity/addIdentity',
    'identity/unlinkIdentity',
    'keystore/updateFilename'
  ],
  statePick: state => ({
    address: {
      names: state.address.names,
      fctRecentlyUsed: state.address.fctRecentlyUsed,
      ecRecentlyUsed: state.address.ecRecentlyUsed,
      preferredEcAddress: state.address.preferredEcAddress
    },
    fatd: {
      endpoint: state.fatd.endpoint
    },
    factomd: {
      endpoint: state.factomd.endpoint
    },
    tokens: {
      tracked: state.tokens.tracked
    },
    identity: {
      identities: state.identity.identities
    },
    keystore: {
      filename: state.keystore.filename
    }
  })
});
