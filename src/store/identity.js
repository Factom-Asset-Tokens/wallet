import { digital } from "factom-identity-lib";
const { FactomIdentityManager } = digital;

export default {
    namespaced: true,
    state: {
        identities: {},
        identityKeysInWallet: new Set()
    },
    getters: {
        manager: (state, getters, rootState) => new FactomIdentityManager({
            factomd: {
                host: rootState.factomd.config.host,
                port: rootState.factomd.config.port,
                retry: { retries: 0 }
            },
            walletd: {
                host: rootState.walletd.config.host,
                port: rootState.walletd.config.port,
                retry: { retries: 0 }
            }
        })
    },
    mutations: {
        updateIdentities: (state, identities) => state.identities = identities,
        updateIdentityKeysInWallet: (state, keysInWallet) => state.identityKeysInWallet = new Set(keysInWallet),
        addIdentity: (state, identity) => state.identities = Object.assign(identity, state.identities)
    },
    actions: {
        async init({ commit, dispatch, rootState }) {
            commit('updateIdentityKeysInWallet', []);
            if (rootState.walletd.status === "ok") {
                await dispatch("fetchIdentityKeysFromWalletd");
                await dispatch("refreshIdentities");
            }
        },
        async fetchIdentityKeysFromWalletd({ commit, getters }) {
            const manager = getters.manager;

            const identityKeys = await manager.getAllIdentityKeys();
            const publicIdentityKeys = identityKeys.map(k => k.public);
            commit('updateIdentityKeysInWallet', publicIdentityKeys);
        },
        async refreshIdentities({ state, getters, commit }) {
            const manager = getters.manager;

            const identities = {};
            await Promise.all(Object.keys(state.identities)
                .map(chainId => manager.getActivePublicIdentityKeys(chainId)
                    .then(keys => identities[chainId] = keys)
                    .catch(e => {
                        console.error(e.message);
                        identities[chainId] = []
                    })
                ));

            commit('updateIdentities', identities);
        },
        async importIdentityKeys({ getters, dispatch }, idKeys) {
            if (idKeys.length > 0) {
                const manager = getters.manager;
                await manager.importIdentityKeys(idKeys);
                await dispatch("fetchIdentityKeysFromWalletd");
            }
        },
    }
}

