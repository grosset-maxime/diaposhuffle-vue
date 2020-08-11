import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    showTheLeftMenu: true,
    showWindowOverlay: false,
    showTheHelp: false,
  },
  mutations: {
    showTheLeftMenu(state, value) {
      state.showTheLeftMenu = value;
    },
    showWindowOverlay(state, value) {
      state.showWindowOverlay = value;
    },
    showTheHelp(state, value) {
      state.showWindowOverlay = value;
      state.showTheHelp = value;
    },
  },
  actions: {
  },
  modules: {
  },
});

// import Vue from 'vue';
// import Vuex from 'vuex';

// Vue.use(Vuex);

// export default new Vuex.Store({
//   // Making sure that we're doing
//   // everything correctly by enabling
//   // strict mode in the dev environment.
//   strict: process.env.NODE_ENV !== 'production',
// });
