/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
import Vue from 'vue';
import {
  PLAYER_OPTS_UI_G_SHOW_PATH,
  PLAYER_OPTS_UI_G_PIN_PATH,
  PLAYER_OPTS_UI_G_SHOW_TAGS,
  PLAYER_OPTS_UI_G_PIN_TAGS,
  PLAYER_OPTS_UI_G_SHOW_HISTORY,
  PLAYER_OPTS_UI_G_PIN_HISTORY,
  PLAYER_OPTS_UI_G_SHOW_LIST_INDEX,
  PLAYER_OPTS_UI_G_PIN_LIST_INDEX,
  PLAYER_OPTS_UI_G_SHOW_LOOP,
  PLAYER_OPTS_UI_G_PIN_LOOP,

  PLAYER_OPTS_UI_M_UI_OPTIONS,
} from '../../types';

const state = () => ({
  showPath: true,
  pinPath: false,

  showTags: true,
  pinTags: true,

  showHistory: true,
  pinHistory: false,

  showListIndex: true,
  pinListIndex: false,

  showLoop: true,
  pinLoop: false,
});

const getters = {
  [PLAYER_OPTS_UI_G_SHOW_PATH]: (state) => state.showPath,
  [PLAYER_OPTS_UI_G_PIN_PATH]: (state) => state.pinPath,

  [PLAYER_OPTS_UI_G_SHOW_TAGS]: (state) => state.showTags,
  [PLAYER_OPTS_UI_G_PIN_TAGS]: (state) => state.pinTags,

  [PLAYER_OPTS_UI_G_SHOW_HISTORY]: (state) => state.showHistory,
  [PLAYER_OPTS_UI_G_PIN_HISTORY]: (state) => state.pinHistory,

  [PLAYER_OPTS_UI_G_SHOW_LIST_INDEX]: (state) => state.showListIndex,
  [PLAYER_OPTS_UI_G_PIN_LIST_INDEX]: (state) => state.pinListIndex,

  [PLAYER_OPTS_UI_G_SHOW_LOOP]: (state) => state.showLoop,
  [PLAYER_OPTS_UI_G_PIN_LOOP]: (state) => state.pinLoop,
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
