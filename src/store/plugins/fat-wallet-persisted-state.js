import Store from 'electron-store'
import createPersistedState from './persisted-state'

const appStore = new Store({ name: 'user-config.v1' })

export default createPersistedState({
    storage: appStore,
    whitelist:
        [
            "address/updateAddressNames",
            "address/setPreferredEcAddress",
            "fatd/updateConfig",
            "factomd/updateConfig",
            "walletd/updateConfig",
            "tokens/track",
            "tokens/untrack",
            "identity/updateIdentities",
            "identity/addIdentity",
            "identity/removeIdentity"
        ],
    statePick: (state) => ({
        address: {
            names: state.address.names,
            preferredEcAddress: state.address.preferredEcAddress
        },
        fatd: {
            config: state.fatd.config
        },
        factomd: {
            config: state.factomd.config
        },
        walletd: {
            config: state.walletd.config
        },
        tokens: {
            tracked: state.tokens.tracked
        },
        identity: {
            identities: state.identity.identities
        }
    })
})