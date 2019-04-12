import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import 'roboto-fontface/css/roboto/roboto-fontface.css';
import 'material-design-icons-iconfont/dist/material-design-icons.css';
import '@fortawesome/fontawesome-free/css/all.css'; // Ensure you are using css-loader
import '@/assets/css/fat-wallet.css'; // Ensure you are using css-loader
import './plugins/vuetify';

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  mounted() {
    // Prevent blank screen in Electron builds
    this.$router.push('Actions');
  },
  render: h => h(App)
}).$mount('#app');
