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
  PLAYER_OPTS_UI_G_SHOW_PINED,
  PLAYER_OPTS_UI_G_PIN_PINED,
  PLAYER_OPTS_UI_G_SHOW_LIST_INDEX,
  PLAYER_OPTS_UI_G_PIN_LIST_INDEX,
  PLAYER_OPTS_UI_G_SHOW_LOOP,
  PLAYER_OPTS_UI_G_PIN_LOOP,

  PLAYER_OPTS_UI_M_UI_OPTIONS,
  PLAYER_OPTS_UI_M_TOGGLE_SHOW_HIDE_ALL,
  PLAYER_OPTS_UI_M_TOGGLE_PIN_UNPIN_ALL,
} from '../../types';

const state = () => ({
  showPath: true,
  pinPath: true,

  showTags: true,
  pinTags: true,

  showHistory: true,
  pinHistory: false,

  showPined: true,
  pinPined: true,

  showListIndex: true,
  pinListIndex: true,

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

  [PLAYER_OPTS_UI_G_SHOW_PINED]: (state) => state.showPined,
  [PLAYER_OPTS_UI_G_PIN_PINED]: (state) => state.pinPined,

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

  [PLAYER_OPTS_UI_M_TOGGLE_SHOW_HIDE_ALL] (state, value) {
    Vue.set(state, 'showPath', value);
    Vue.set(state, 'showTags', value);
    Vue.set(state, 'showHistory', value);
    Vue.set(state, 'showPined', value);
    Vue.set(state, 'showListIndex', value);
    Vue.set(state, 'showLoop', value);
  },

  [PLAYER_OPTS_UI_M_TOGGLE_PIN_UNPIN_ALL] (state, value) {
    Vue.set(state, 'pinPath', value);
    Vue.set(state, 'pinTags', value);
    Vue.set(state, 'pinHistory', value);
    Vue.set(state, 'pinPined', value);
    Vue.set(state, 'pinListIndex', value);
    Vue.set(state, 'pinLoop', value);
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
