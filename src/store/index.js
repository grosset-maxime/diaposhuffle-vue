import Vue from 'vue';
import Vuex from 'vuex';

import {
  SHOW_THE_LEFT_MENU,
  SHOW_THE_OVERLAY,
  SHOW_THE_HELP,
} from './mutations-types';

import diaposhuffle from './modules/diaposhuffle';

Vue.use(Vuex);

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',

  state: {
    showTheLeftMenu: true,
    showTheOverlay: false,
    showTheHelp: false,
  },

  getters: {
    showTheLeftMenu: (state) => state.showTheLeftMenu,
    showTheOverlay: (state) => state.showTheOverlay,
    showTheHelp: (state) => state.showTheHelp,
  },

  mutations: {
    [SHOW_THE_LEFT_MENU]: (state, value) => { state.showTheLeftMenu = value; },

    [SHOW_THE_OVERLAY]: (state, value) => { state.showTheOverlay = value; },

    [SHOW_THE_HELP]: (state, value) => {
      state.showTheOverlay = value;
      state.showTheHelp = value;
    },
  },

  actions: {
  },

  modules: {
    diaposhuffle,
  },
});
