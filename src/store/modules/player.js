/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */

import {
  PLAYER_G_START,
  PLAYER_G_STOP,
  PLAYER_G_PAUSE,

  PLAYER_M_START,
  PLAYER_M_STOP,
  PLAYER_M_PAUSE,
} from '../types';

const state = () => ({
  start: false,
  stop: true,
  pause: false,
});

const getters = {
  [PLAYER_G_START]: (state) => state.start,
  [PLAYER_G_STOP]: (state) => state.stop,
  [PLAYER_G_PAUSE]: (state) => state.pause,
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
};

const actions = {};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
