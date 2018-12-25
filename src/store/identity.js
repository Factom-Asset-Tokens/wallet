import { digital } from "factom-identity-lib";
const { FactomIdentityManager } = digital;

export default {
    namespaced: true,
    state: {
        identities: {
            '44f7e377f62fe5e760cd4e3e1f34ea26fc6b0a6628a5246ef4296f0f509f6dc1': [],
            'e94783624ebe76c2321b69d063c6b80a074a55ca9b16ac27dc90bfaacd474856': []
        },
        identityKeysInWallet: new Set()
    },
    getters: {
        manager: (state, getters, rootState) => new FactomIdentityManager({
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
        async init({ dispatch }) {
            await dispatch("fetchIdentityKeysFromWalletd");
            await dispatch("refreshIdentities");
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

