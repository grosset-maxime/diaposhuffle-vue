/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
import Vue from 'vue';
import { buildError } from '../../api/api';
import { getRandomElementWithIndex } from '../../utils/utils';
import {
  fetchRandomItem,
  fetchItemsFromBdd,
  deleteItem,
  setItemTags,
} from '../../api/items';
import {
  PLAYER_G_FILTER_FILE_TYPES,
  PLAYER_G_FILTERS,
  PLAYER_G_OPTIONS,

  PLAYER_G_HISTORY,
  PLAYER_G_HISTORY_LENGTH,
  PLAYER_G_HISTORY_INDEX,
  PLAYER_G_HISTORY_ITEM,

  PLAYER_G_ITEMS,
  PLAYER_G_ITEMS_LENGTH,
  PLAYER_G_CURRENT_ITEM_INDEX,
  PLAYER_G_CURRENT_ITEM,

  PLAYER_M_FILTERS,
  PLAYER_M_OPTIONS,
  PLAYER_M_RESET_INTERVAL,
  PLAYER_M_SET_HISTORY_INDEX,
  PLAYER_M_ADD_HISTORY_ITEM,
  PLAYER_M_EDIT_HISTORY_ITEM,
  PLAYER_M_DELETE_HISTORY_ITEM,
  PLAYER_M_ADD_ERROR,
  PLAYER_M_TOGGLE_TAGS_OPERATOR,

  PLAYER_A_FETCH_NEXT,
  PLAYER_A_FETCH_ITEMS_FROM_RANDOM,
  PLAYER_A_FETCH_ITEMS_FROM_BDD,
  PLAYER_A_DELETE_ITEM,
  PLAYER_A_SET_ITEM_TAGS,
} from '../types';

const INTERVAL_DEFAULT = 3; // seconds
const FETCH_FROM_RANDOM = 'random';
const FETCH_FROM_ITEMS = 'items';
const TAGS_OPERATOR_OR = 'OR';
const TAGS_OPERATOR_AND = 'AND';

const state = () => ({
  filterFileTypes: ['JPG', 'GIF', 'PNG', 'WEBM', 'MP4', 'MKV'],

  filters: {
    folders: [],
    tags: [], // List of tags ids.
    tagsOperator: TAGS_OPERATOR_AND,
    fileTypes: [],
  },

  // TODO: Enh: create sections to separate easily options.
  options: {
    interval: INTERVAL_DEFAULT,
    zoom: 1,
    scale: true,
    showPath: true,
    pinPath: false,
    showFromPined: false,
    showTags: true,
    pinTags: true,
    muteVideo: true,
    fetchItemRandomly: true,
  },

  history: {
    items: [],
    index: 0,
  },

  errors: [],

  items: [],
  itemIndex: -1,

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

  [PLAYER_G_ITEMS]: (state) => state.items,
  [PLAYER_G_ITEMS_LENGTH]: (state) => state.items.length,
  [PLAYER_G_CURRENT_ITEM_INDEX]: (state) => state.itemIndex,
  [PLAYER_G_CURRENT_ITEM]: (state) => (index) => state.items[index],
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

  [PLAYER_M_EDIT_HISTORY_ITEM] (state, { index, item }) {
    Vue.set(state.history.items, index, item);
  },

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

  [PLAYER_M_TOGGLE_TAGS_OPERATOR] (state) {
    const operator = state.filters.tagsOperator === TAGS_OPERATOR_OR
      ? TAGS_OPERATOR_AND
      : TAGS_OPERATOR_OR;

    Vue.set(state.filters, 'tagsOperator', operator);
  },

  setItems (state, items) { state.items = items },

  clearItems (state) { state.items = [] },

  setItemIndex (state, index) { state.itemIndex = index },

  setFetchNextFrom (state, value) { state.fetchNextFrom = value },
};

const actions = {

  // TODO: Feature: Add fetch items from bdd with tags and types.
  // TODO: Bug: Backend: getimagesize raize warning in call response body that trigger json.parse to fail. Should be added to the response object as error.
  async [PLAYER_A_FETCH_NEXT] ({ state, commit, getters }) {
    let result;

    const filters = getters[PLAYER_G_FILTERS];
    const options = getters[PLAYER_G_OPTIONS];

    try {
      if (state.fetchNextFrom === FETCH_FROM_ITEMS) {
        let index;
        let el;

        if (options.fetchItemRandomly) {
          const obj = getRandomElementWithIndex(state.items);
          el = obj.el;
          index = obj.index;
        } else {
          index = state.itemIndex + 1;
          if (index >= state.items.length) {
            index = 0;
          }
          el = state.items[index];
        }

        result = el;
        commit('setItemIndex', index);
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

  async [PLAYER_A_DELETE_ITEM] ({ commit }, { itemSrc, fromBddOnly, ignoreIfNotExist }) {
    let result = false;

    try {
      result = await deleteItem({ itemSrc, fromBddOnly, ignoreIfNotExist });
    } catch (e) {
      const error = buildError(e);
      commit(PLAYER_M_ADD_ERROR, { actionName: PLAYER_A_DELETE_ITEM, error });
      throw error;
    }

    return result;
  },

  async [PLAYER_A_SET_ITEM_TAGS] ({ commit }, { item }) {
    let result = false;

    try {
      result = await setItemTags({ item });
    } catch (e) {
      const error = buildError(e);
      commit(PLAYER_M_ADD_ERROR, { actionName: PLAYER_A_SET_ITEM_TAGS, error });
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
