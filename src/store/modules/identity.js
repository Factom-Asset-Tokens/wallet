import { digital } from "factom-identity-lib";
const { FactomIdentityManager } = digital;

export default {
    namespaced: true,
    state: {
        identities: {},
        identityKeysInWallet: new Set()
    },
    getters: {
        manager: function (state, getters, rootState, rootGetters) {
            const config = {
                factomd: rootGetters['factomd/config'],
                walletd: rootGetters['walletd/config']
            };

            return new FactomIdentityManager(config);
        }
    },
    mutations: {
        updateIdentities: (state, identities) => state.identities = identities,
        updateIdentityKeysInWallet: (state, keysInWallet) => state.identityKeysInWallet = new Set(keysInWallet),
        addIdentity: (state, identity) => state.identities = Object.assign(identity, state.identities),
        removeIdentity(state, identity) {
            const copy = { ...state.identities };
            delete copy[identity];
            state.identities = copy;
        }
    },
    actions: {
        async init({ commit, dispatch, rootState }) {
            if (rootState.walletd.status === "ok" && rootState.walletd.identitySupport) {
                await dispatch("fetchIdentityKeysFromWalletd");
                await dispatch("refreshIdentities");
            } else {
                commit('updateIdentityKeysInWallet', []);
            }
        },
        async fetchIdentityKeysFromWalletd({ commit, getters }) {
            const manager = getters.manager;

            const identityKeys = await manager.getAllIdentityKeys();
            const publicIdentityKeys = (identityKeys || []).map(k => k.public);
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

