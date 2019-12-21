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

// Prevent accidental type coercion
// http://mikemcl.github.io/bignumber.js/#type-coercion
BigNumber.prototype.valueOf = function() {
  throw Error('valueOf called!');
};

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  mounted() {
    if (this.$store.state.licenseAccepted) {
      // Prevent blank screen in Electron builds
      this.$router.replace({ name: 'Start' });
    } else {
      this.$router.replace({ name: 'AcceptLicense' });
    }
  },
  render: h => h(App)
}).$mount('#app');
