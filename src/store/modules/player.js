/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
import Vue from 'vue';
import { getHeaders } from '../../utils/utils';
import { createItem } from '../../models/item';
import {
  PLAYER_G_FILTER_FILE_TYPES,
  PLAYER_G_FILTERS,
  PLAYER_G_OPTIONS,
  PLAYER_G_HISTORY,
  PLAYER_G_HISTORY_LENGTH,
  PLAYER_G_HISTORY_INDEX,
  PLAYER_G_HISTORY_ITEM,

  PLAYER_M_FILTERS,
  PLAYER_M_OPTIONS,
  PLAYER_M_RESET_INTERVAL,
  PLAYER_M_SET_HISTORY_INDEX,
  PLAYER_M_ADD_HISTORY_ITEM,
  PLAYER_M_DELETE_HISTORY_ITEM,
  PLAYER_M_ADD_ERROR,

  PLAYER_A_FETCH_NEXT,
  PLAYER_A_DELETE_ITEM,
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

  history: {
    items: [],
    index: 0,
  },

  errors: [],
});

const getters = {
  [PLAYER_G_FILTER_FILE_TYPES]: (state) => state.filterFileTypes,
  [PLAYER_G_FILTERS]: (state) => state.filters,
  [PLAYER_G_OPTIONS]: (state) => state.options,
  [PLAYER_G_HISTORY]: (state) => state.history,
  [PLAYER_G_HISTORY_LENGTH]: (state) => state.history.items.length,
  [PLAYER_G_HISTORY_INDEX]: (state) => state.history.index,
  [PLAYER_G_HISTORY_ITEM]: (state) => (index) => state.history.items[index],
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

  [PLAYER_M_RESET_INTERVAL] (state) { state.options.interval = INTERVAL_DEFAULT },

  [PLAYER_M_SET_HISTORY_INDEX] (state, index) { state.history.index = index },

  [PLAYER_M_ADD_HISTORY_ITEM] (state, item) { state.history.items.push(item) },

  [PLAYER_M_DELETE_HISTORY_ITEM] (state, itemSrc) {
    state.history.items = state.history.items.filter(
      (item) => item.src !== itemSrc,
    );
  },

  [PLAYER_M_ADD_ERROR] (state, { actionName, error }) {
    const e = {};
    e[actionName] = error;
    state.errors.push(e);
    // eslint-disable-next-line no-console
    console.error(actionName, error);
  },
};

const actions = {

  async [PLAYER_A_FETCH_NEXT] ({ commit, getters }) {
    const url = `${BASE_URL}/api/getRandomPic`;
    const opts = {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        customFolders: getters[PLAYER_G_FILTERS].folders,
      }),
    };

    const onError = (error) => {
      commit(PLAYER_M_ADD_ERROR, { actionName: PLAYER_A_FETCH_NEXT, error });
      return error;
    };

    const response = await fetch(url, opts)
      .then((response) => response.json().then((json) => {
        if (json.success) {
          json.item = createItem(json.pic);
        }
        if (json.error) { onError(json) }

        return json;
      }))
      .catch((error) => onError({ error: true, publicMessage: error.toString() }));

    return response;
  },

  async [PLAYER_A_DELETE_ITEM] ({ commit }, itemSrc) {
    const url = `${BASE_URL}/api/deletePic`;
    const opts = {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        picPath: itemSrc,
        continueIfNotExist: false,
        deleteOnlyFromBdd: false,
      }),
    };

    const onError = (error) => {
      commit(PLAYER_M_ADD_ERROR, { actionName: PLAYER_A_DELETE_ITEM, error });
      return error;
    };

    const response = await fetch(url, opts)
      .then((response) => response.json().then((json) => {
        if (json.error) { onError(json) }
        return json;
      }))
      .catch((error) => onError({ error: true, publicMessage: error.toString() }));

    return response;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
