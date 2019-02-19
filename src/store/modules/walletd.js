import { WalletdCli } from "factom";

export default {
    namespaced: true,
    state: {
        config: {
            host: 'localhost',
            port: 8089
        },
        status: null,
        version: null,
        identitySupport: false
    },
    getters: {
        cli: state => new WalletdCli({
            host: state.config.host,
            port: state.config.port,
            retry: { retries: 0 }
        })
    },
    mutations: {
        updateStatus: (state, status) => state.status = status,
        updateVersion: (state, version) => state.version = version,
        updateConfig: (state, config) => state.config = config,
        updateIdentitySupport: (state, identitySupport) => state.identitySupport = identitySupport
    },
    actions: {
        async update({ commit, dispatch }, config) {
            commit('updateConfig', config);
            await dispatch('checkStatus');
        },
        async checkStatus({ commit, getters }) {
            const cli = getters.cli;

            try {
                const { walletversion } = await cli.call('properties');
                if (walletversion) {
                    commit('updateStatus', "ok");
                    commit('updateVersion', walletversion);
                    commit('updateIdentitySupport', supportsIdentity(walletversion));
                } else {
                    commit('updateStatus', "ko");
                    commit('updateIdentitySupport', false);
                }
            } catch (e) {
                commit('updateStatus', "ko");
                commit('updateIdentitySupport', false);
            }
        }
    }
}

function supportsIdentity(semver) {
    const versions = semver.split('.');
    return versions[0] >= "2" && versions[1] >= "2" && versions[2] >= "15";
}

