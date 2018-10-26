import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
    state: {
        settings: {
            fatd: {
                host: 'localhost',
                port: 8078
            }
        }
    },
    getters: {
        fatdEndPoint: state => `http://${state.settings.fatd.host}:${state.settings.fatd.port}`
    },
    mutations: {
        updateFatdHost: (state, host) => state.settings.fatd.port = host,
        updateFatdPort: (state, port) => state.settings.fatd.port = port

    },
    strict: debug
});