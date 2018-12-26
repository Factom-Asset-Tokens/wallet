import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production';

import factomd from '@/store/factomd'
import walletd from '@/store/walletd'
import fatd from '@/store/fatd'
import tokens from '@/store/tokens'
import address from '@/store/address'
import identity from '@/store/identity'

export default new Vuex.Store({
    modules: {
        factomd,
        walletd,
        fatd,
        tokens,
        address,
        identity
    },
    getters: {
        daemonsKo: state => state.fatd.status === 'ko' || state.walletd.status === 'ko' || state.factomd.status === 'ko'
    }, actions: {
        async init({ dispatch }) {
            await Promise.all([
                dispatch('walletd/checkStatus'),
                dispatch('factomd/checkStatus'),
                dispatch('fatd/checkStatus')]);
            await Promise.all([dispatch('address/init'), dispatch('identity/init')]);
        }
    },
    strict: debug
});