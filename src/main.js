import Vue from 'vue';

import vuetify from './plugins/vuetify';
import VueRouter from './plugins/VueRouter';

import App from './App.vue';
import store from './store';

Vue.config.productionTip = false;

new Vue({
  store,
  VueRouter,
  vuetify,
  render: (h) => h(App),
}).$mount('#app');
