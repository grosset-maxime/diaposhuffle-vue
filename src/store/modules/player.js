/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
import Vue from 'vue';

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

let i = 0;
function wait (time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time * 1000);
  });
}
const actions = {
  async [PLAYER_A_FETCH_NEXT] ({ commit }) {
    const imgs = [
      '/pic/test/bbb/5718897981_10faa45ac3_b-640x624.jpg',
      '/pic/test/bbb/a.gif',
      '/pic/test/bbb/DSCF2336.jpg',
      '/pic/test/bbb/i-B7D3LH9-L.jpg',
      '/pic/test/bbb/test.jpg',
    ];
    let next = imgs[i];

    if (!next) {
      i = 1;
      [next] = imgs;
    } else {
      i += 1;
    }

    // {"success":true,
    // "pic":{
    // eslint-disable-next-line max-len
    //   "src":"/pic/test/bbb/5718897981_10faa45ac3_b-640x624.jpg",
    //   "randomPublicPath":"/test/bbb/",
    //   "customFolderPath":"",
    //   "name":"5718897981_10faa45ac3_b-640x624.jpg",
    //   "extension":"jpg",
    //   "width":1465,
    //   "height":2160,
    //   "tags":[],
    //   "useCache":false,
    //   "warning":""
    // }}

    await wait(1);
    commit(PLAYER_M_SET_NEXT, { src: next });
    return { src: next };
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
