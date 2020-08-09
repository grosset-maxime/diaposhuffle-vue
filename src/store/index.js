import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    showTheLeftMenu: true,
  },
  mutations: {
    showTheLeftMenu(state, value) {
      state.showTheLeftMenu = value;
    },
  },
  actions: {
  },
  modules: {
  },
});
