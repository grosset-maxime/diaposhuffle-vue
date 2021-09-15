/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
import Vue from 'vue';
import {
  PLAYER_OPTS_UI_G_SHOW_PATH,
  PLAYER_OPTS_UI_G_PIN_PATH,
  PLAYER_OPTS_UI_G_SHOW_TAGS,
  PLAYER_OPTS_UI_G_PIN_TAGS,

  PLAYER_OPTS_UI_M_UI_OPTIONS,
} from '../../types';

const state = () => ({
  showPath: true,
  pinPath: false,

  showTags: true,
  pinTags: true,
});

const getters = {
  [PLAYER_OPTS_UI_G_SHOW_PATH]: (state) => state.showPath,

  [PLAYER_OPTS_UI_G_PIN_PATH]: (state) => state.pinPath,

  [PLAYER_OPTS_UI_G_SHOW_TAGS]: (state) => state.showTags,

  [PLAYER_OPTS_UI_G_PIN_TAGS]: (state) => state.pinTags,
};

const mutations = {
  [PLAYER_OPTS_UI_M_UI_OPTIONS] (state, options) {
    Object.keys(options).forEach((key) => {
      Vue.set(state, key, options[key]);
    });
  },
};

const actions = {};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
