/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
import Vue from 'vue';

import {
  PLAYER_G_START,
  PLAYER_G_STOP,
  PLAYER_G_PAUSE,
  PLAYER_G_FILTER_FILE_TYPES,
  PLAYER_G_FILTERS,
  PLAYER_G_OPTIONS,

  PLAYER_M_START,
  PLAYER_M_STOP,
  PLAYER_M_PAUSE,
  PLAYER_M_FILTERS,
  PLAYER_M_OPTIONS,
  PLAYER_M_RESET_INTERVAL,
} from '../types';

const INTERVAL_DEFAULT = 3; // seconds

const state = () => ({
  start: false,
  stop: true,
  pause: false,

  filterFileTypes: ['JPEG', 'GIF', 'PNG', 'WEBM', 'MP4', 'MKV'],

  filters: {
    folders: [],
    tags: [],
    fileTypes: [],
  },

  options: {
    interval: INTERVAL_DEFAULT,
    zoom: 1,
    scale: true,
    showPath: true,
    showFromPined: false,
    showTags: true,
    muteVideo: true,
  },
});

const getters = {
  [PLAYER_G_START]: (state) => state.start,
  [PLAYER_G_STOP]: (state) => state.stop,
  [PLAYER_G_PAUSE]: (state) => state.pause,
  [PLAYER_G_FILTER_FILE_TYPES]: (state) => state.filterFileTypes,
  [PLAYER_G_FILTERS]: (state) => state.filters,
  [PLAYER_G_OPTIONS]: (state) => state.options,
};

const mutations = {
  [PLAYER_M_START] (state) {
    state.start = true;
    state.stop = false;
  },

  [PLAYER_M_STOP] (state) {
    state.stop = true;
    state.start = false;
  },

  [PLAYER_M_PAUSE] (state) {
    state.pause = true;
  },

  [PLAYER_M_FILTERS] (state, filters) {
    Object.keys(filters).forEach((keys) => {
      Vue.set(state.filters, keys, filters[keys]);
    });
  },

  [PLAYER_M_OPTIONS] (state, options) {
    Object.keys(options).forEach((keys) => {
      Vue.set(state.options, keys, options[keys]);
    });
  },

  [PLAYER_M_RESET_INTERVAL] (state) {
    state.options.interval = INTERVAL_DEFAULT;
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
