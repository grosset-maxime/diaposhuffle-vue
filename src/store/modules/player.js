/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
import Vue from 'vue';
import { createItem } from '../../models/item';
import {
  PLAYER_G_FILTER_FILE_TYPES,
  PLAYER_G_FILTERS,
  PLAYER_G_OPTIONS,

  PLAYER_M_FILTERS,
  PLAYER_M_OPTIONS,
  PLAYER_M_RESET_INTERVAL,
  PLAYER_M_SET_NEXT,

  PLAYER_A_FETCH_NEXT,
} from '../types';

const BASE_URL = process.env.VUE_APP_BASE_URL || '';

const INTERVAL_DEFAULT = 3; // seconds

const state = () => ({
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
  [PLAYER_G_FILTER_FILE_TYPES]: (state) => state.filterFileTypes,
  [PLAYER_G_FILTERS]: (state) => state.filters,
  [PLAYER_G_OPTIONS]: (state) => state.options,
};

const mutations = {
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

  [PLAYER_M_SET_NEXT] (state, next) {
    state.next = next;
  },
};

// function wait (time) {
//   return new Promise((resolve) => {
//     setTimeout(resolve, time * 1000);
//   });
// }
const actions = {

  async [PLAYER_A_FETCH_NEXT] ({ commit }) {
    const url = `${BASE_URL}/api/getRandomPic`;
    const opts = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customFolders: [],
      }),
    };

    const next = await fetch(url, opts)
      .then((response) => response.json().then((json) => {
        if (json.success) {
          // commit('onGetRandom', json);
          const item = createItem(json.pic);
          commit(PLAYER_M_SET_NEXT, item);
          return item;
        }
        return json;
        // commit('onGetRandomError', json.error);
      }))
      .catch((/* error */) => {
        // console.error(error);
        // const e = { publicMessage: error.toString() };
        // commit('onGetRandomError', e);
      });

    console.log(next);

    // await wait(1);
    return next;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
