import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production';

import walletd from '@/store/walletd'
import fatd from '@/store/fatd'
import tokens from '@/store/tokens'

export default new Vuex.Store({
    modules: {
        walletd,
        fatd,
        tokens
    },
    strict: debug
});