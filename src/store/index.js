import Vue from 'vue';
import Vuex from 'vuex';

import {
  INDEX_G_SHOW_THE_LEFT_MENU,
  INDEX_G_SHOW_THE_HELP,
  INDEX_G_SHOW_THE_PLAYER,

  INDEX_M_SHOW_THE_LEFT_MENU,
  INDEX_M_SHOW_THE_HELP,
  INDEX_M_SHOW_THE_PLAYER,

  INDEX_A_PLAYER_START,
  INDEX_A_PLAYER_STOP,
} from './types';

import diaposhuffle from './modules/diaposhuffle';
import player from './modules/player';
import folderBrowser from './modules/folderBrowser';
import tagger from './modules/tagger';

Vue.use(Vuex);

const store = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',

  state: () => ({
    showTheLeftMenu: true,
    showTheHelp: false,
    showThePlayer: false,
  }),

  getters: {
    [INDEX_G_SHOW_THE_LEFT_MENU]: (state) => state.showTheLeftMenu,
    [INDEX_G_SHOW_THE_HELP]: (state) => state.showTheHelp,
    [INDEX_G_SHOW_THE_PLAYER]: (state) => state.showThePlayer,
  },

  mutations: {
    [INDEX_M_SHOW_THE_LEFT_MENU] (state, show) { state.showTheLeftMenu = show },

    [INDEX_M_SHOW_THE_HELP] (state, show) { state.showTheHelp = show },

    [INDEX_M_SHOW_THE_PLAYER] (state, show) { state.showThePlayer = show },
  },

  actions: {
    [INDEX_A_PLAYER_START] ({ commit }) {
      commit(INDEX_M_SHOW_THE_PLAYER, true);
    },
    [INDEX_A_PLAYER_STOP] ({ commit }) {
      commit(INDEX_M_SHOW_THE_PLAYER, false);
    },
  },

  modules: {
    diaposhuffle,
    player,
    folderBrowser,
    tagger,
  },
});

// Player.init({ store });

export default store;
