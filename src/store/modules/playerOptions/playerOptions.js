/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
import Vue from 'vue';
import {
  PLAYER_OPTS_PLAYER_G_INTERVAL,
  PLAYER_OPTS_PLAYER_G_ZOOM,
  PLAYER_OPTS_PLAYER_G_MUTE_VIDEO,
  PLAYER_OPTS_PLAYER_G_FETCH_ITEM_RANDOMLY,

  PLAYER_OPTS_PLAYER_M_PLAYER_OPTIONS,
  PLAYER_OPTS_PLAYER_M_RESET_INTERVAL,
} from '../../types';

const INTERVAL_DEFAULT = 3; // seconds

const state = () => ({
  interval: INTERVAL_DEFAULT,

  zoom: 1,

  scale: true,

  muteVideo: true,

  fetchItemRandomly: true,
});

const getters = {
  [PLAYER_OPTS_PLAYER_G_INTERVAL]: (state) => state.interval,

  [PLAYER_OPTS_PLAYER_G_ZOOM]: (state) => state.zoom,

  [PLAYER_OPTS_PLAYER_G_MUTE_VIDEO]: (state) => state.muteVideo,

  [PLAYER_OPTS_PLAYER_G_FETCH_ITEM_RANDOMLY]: (state) => state.fetchItemRandomly,
};

const mutations = {
  [PLAYER_OPTS_PLAYER_M_PLAYER_OPTIONS] (state, options) {
    Object.keys(options).forEach((key) => {
      Vue.set(state, key, options[key]);
    });
  },

  [PLAYER_OPTS_PLAYER_M_RESET_INTERVAL] (state) {
    Vue.set(state, 'interval', INTERVAL_DEFAULT);
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
