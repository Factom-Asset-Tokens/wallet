import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import 'roboto-fontface/css/roboto/roboto-fontface.css';
import 'material-design-icons-iconfont/dist/material-design-icons.css';
import '@fortawesome/fontawesome-free/css/all.css'; // Ensure you are using css-loader
import '@/assets/css/fat-wallet.css'; // Ensure you are using css-loader
import './plugins/vuetify';
import BigNumber from 'bignumber.js';
import * as Sentry from '@sentry/browser';
import * as Integrations from '@sentry/integrations';
import { version } from '../package.json';

// Prevent accidental type coercion
// http://mikemcl.github.io/bignumber.js/#type-coercion
BigNumber.prototype.valueOf = function() {
  throw Error('valueOf called!');
};

Vue.config.productionTip = false;
if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: 'https://ee4a69ddc0494b24a0dd4fdcbc905526@sentry.io/1442979',
    release: `fat-wallet@${version}`,
    integrations: [
      new Integrations.Vue({
        Vue
      })
    ]
  });
}

new Vue({
  router,
  store,
  mounted() {
    // Prevent blank screen in Electron builds
    this.$router.replace({ name: 'Start' });
  },
  render: h => h(App)
}).$mount('#app');
