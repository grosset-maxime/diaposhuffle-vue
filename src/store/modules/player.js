/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
import Vue from 'vue';
import { buildError } from '../../api/api';
import { getRandomElement } from '../../utils/utils';
import {
  fetchRandomItem,
  fetchItemsFromBdd,
  deleteItem,
} from '../../api/items';
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
  PLAYER_A_FETCH_ITEMS_FROM_RANDOM,
  PLAYER_A_FETCH_ITEMS_FROM_BDD,
  PLAYER_A_DELETE_ITEM,
} from '../types';

const INTERVAL_DEFAULT = 3; // seconds
const FETCH_FROM_RANDOM = 'random';
const FETCH_FROM_ITEMS = 'items';
const TAGS_OPERATOR_OR = 'OR';
// const TAGS_OPERATOR_AND = 'AND';

const state = () => ({
  filterFileTypes: ['JPG', 'GIF', 'PNG', 'WEBM', 'MP4', 'MKV'],

  filters: {
    folders: [],
    tags: [], // List of tags ids.
    tagsOperator: TAGS_OPERATOR_OR,
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

  items: [],

  // Possible values: FETCH_FROM_RANDOM, FETCH_FROM_ITEMS.
  fetchNextFrom: FETCH_FROM_RANDOM,
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

  [PLAYER_M_RESET_INTERVAL] (state) {
    Vue.set(state.options, 'interval', INTERVAL_DEFAULT);
  },

  [PLAYER_M_SET_HISTORY_INDEX] (state, index) {
    Vue.set(state.history, 'index', index);
  },

  [PLAYER_M_ADD_HISTORY_ITEM] (state, item) { state.history.items.push(item) },

  [PLAYER_M_DELETE_HISTORY_ITEM] (state, itemSrc) {
    Vue.set(state.history, 'index', state.history.index - 1);
    Vue.set(
      state.history,
      'items',
      state.history.items.filter((item) => item.src !== itemSrc),
    );
  },

  [PLAYER_M_ADD_ERROR] (state, { actionName, error }) {
    const e = {};
    e[actionName] = error;
    state.errors.push(e);
    // eslint-disable-next-line no-console
    console.error(`Error from "${actionName}":`, error);
  },

  setItems (state, items) { state.items = items },

  clearItems (state) { state.items = [] },

  setFetchNextFrom (state, value) { state.fetchNextFrom = value },
};

const actions = {

  // TODO: Feature: Add fetch items from bdd with tags and types.
  // TODO: Bug: Backend: getimagesize raize warning in call response body that trigger json.parse to fail. Should be added to the response object as error.
  async [PLAYER_A_FETCH_NEXT] ({ state, commit, getters }) {
    let result;

    const filters = getters[PLAYER_G_FILTERS];

    try {
      if (state.fetchNextFrom === FETCH_FROM_ITEMS) {
        result = getRandomElement(state.items);
      } else if (state.fetchNextFrom === FETCH_FROM_RANDOM) {
        result = await fetchRandomItem({
          folders: filters.folders,
        });
      } else {
        throw new Error(`Invalid state.fetchNextFrom:"${state.fetchNextFrom}"`);
      }
    } catch (e) {
      const error = buildError(e);
      commit(PLAYER_M_ADD_ERROR, { actionName: PLAYER_A_FETCH_NEXT, error });
      throw error;
    }

    return result.item;
  },

  [PLAYER_A_FETCH_ITEMS_FROM_RANDOM] ({ commit }) {
    commit('clearItems');
    commit('setFetchNextFrom', FETCH_FROM_RANDOM);
    return Promise.resolve();
  },

  async [PLAYER_A_FETCH_ITEMS_FROM_BDD] ({ commit, getters }) {
    let items;

    const { tags, tagsOperator, fileTypes } = getters[PLAYER_G_FILTERS];

    try {
      items = await fetchItemsFromBdd({
        tags,
        tagsOperator,
        types: fileTypes,
      });
      commit('setItems', items);
      commit('setFetchNextFrom', FETCH_FROM_ITEMS);
    } catch (e) {
      const error = buildError(e);
      commit(PLAYER_M_ADD_ERROR, { actionName: PLAYER_A_FETCH_ITEMS_FROM_BDD, error });
      throw error;
    }

    return items;
  },

  async [PLAYER_A_DELETE_ITEM] ({ commit }, itemSrc) {
    let result = false;

    try {
      result = await deleteItem({ itemSrc });
    } catch (e) {
      const error = buildError(e);
      commit(PLAYER_M_ADD_ERROR, { actionName: PLAYER_A_DELETE_ITEM, error });
      throw error;
    }

    return result;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
