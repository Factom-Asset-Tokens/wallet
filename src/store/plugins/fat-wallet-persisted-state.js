import Store from 'electron-store';
import createPersistedState from './persisted-state';

const appStore = new Store({ name: 'user-config.v1' });

export default createPersistedState({
  storage: appStore,
  whitelist: [
    'acceptLicense',
    'address/updateAddressNames',
    'address/setPreferredEcAddress',
    'address/addAddressToBook',
    'address/removeFromAddressBook',
    'fatd/updateEndpoint',
    'factomd/updateEndpoint',
    'tokens/addToken',
    'tokens/removeToken',
    'identity/updateIdentities',
    'identity/addIdentity',
    'identity/unlinkIdentity',
    'keystore/updateFilename',
    'ledger/setLegacyDerivation'
  ],
  statePick: state => ({
    licenseAccepted: state.licenseAccepted,
    address: {
      names: state.address.names,
      bookAddresses: state.address.bookAddresses,
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
    },
    ledger: {
      legacyDerivation: state.ledger.legacyDerivation
    }
  })
});
