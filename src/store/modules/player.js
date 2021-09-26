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
  PLAYER_G_HISTORY,
  PLAYER_G_HISTORY_LENGTH,
  PLAYER_G_HISTORY_INDEX,
  PLAYER_G_HISTORY_ITEM,

  PLAYER_G_ITEMS,
  PLAYER_G_ITEMS_LENGTH,
  PLAYER_G_CURRENT_ITEM_INDEX,
  PLAYER_G_CURRENT_ITEM,

  PLAYER_G_PINEDS,
  PLAYER_G_PINEDS_LENGTH,
  PLAYER_G_CURRENT_PINED_ITEM,
  PLAYER_G_CURRENT_PINED_ITEM_INDEX,

  PLAYER_G_FETCH_NEXT_FROM,
  PLAYER_G_IS_FETCH_NEXT_FROM_ITEMS,
  PLAYER_G_IS_FETCH_NEXT_FROM_PINEDS,
  PLAYER_G_PINED_INDEX,

  PLAYER_M_SET_CURRENT_ITEM_INDEX,
  PLAYER_M_SET_CURRENT_PINED_INDEX,

  PLAYER_M_SET_HISTORY_INDEX,
  PLAYER_M_ADD_HISTORY_ITEM,
  PLAYER_M_EDIT_HISTORY_ITEM,
  PLAYER_M_DELETE_HISTORY_ITEM,
  PLAYER_M_ADD_ERROR,

  PLAYER_M_ADD_ITEM_TO_PINEDS,
  PLAYER_M_REMOVE_ITEM_TO_PINEDS,
  PLAYER_M_CLEAR_PINEDS,

  PLAYER_A_FETCH_NEXT,
  PLAYER_A_FETCH_PREVIOUS,
  PLAYER_A_FETCH_ITEMS_FROM_RANDOM,
  PLAYER_A_FETCH_ITEMS_FROM_BDD,
  PLAYER_A_DELETE_ITEM,
  PLAYER_A_SET_ITEM_TAGS,

  PLAYER_OPTS_SRC_G_FOLDERS,
  PLAYER_OPTS_SRC_G_TAGS,
  PLAYER_OPTS_SRC_G_TAGS_OPERATOR,
  PLAYER_OPTS_SRC_G_FILE_TYPES,

  PLAYER_OPTS_PLAYER_G_FETCH_ITEM_RANDOMLY,
  PLAYER_A_FETCH_ITEMS_FROM_PINEDS,
} from '../types';

const FETCH_FROM_RANDOM = 'random';
const FETCH_FROM_ITEMS = 'items';
const FETCH_FROM_PINEDS = 'pineds';

const PLAYER_OPTS_SRC_NS = 'playerOptionsSource';
const PLAYER_OPTS_PLAYER_NS = 'playerOptionsPlayer';

const state = () => ({
  history: {
    items: [],
    index: 0,
  },

  errors: [],

  items: [],
  itemIndex: -1,

  pineds: [],
  pinedIndex: -1,

  // Possible values: FETCH_FROM_RANDOM, FETCH_FROM_ITEMS, FETCH_FROM_PINEDS.
  fetchNextFrom: FETCH_FROM_RANDOM,
});

const getters = {
  [PLAYER_G_HISTORY]: (state) => state.history,
  [PLAYER_G_HISTORY_LENGTH]: (state) => state.history.items.length,
  [PLAYER_G_HISTORY_INDEX]: (state) => state.history.index,
  [PLAYER_G_HISTORY_ITEM]: (state) => (index) => state.history.items[index],

  [PLAYER_G_ITEMS]: (state) => state.items,
  [PLAYER_G_ITEMS_LENGTH]: (state) => state.items.length,
  [PLAYER_G_CURRENT_ITEM_INDEX]: (state) => state.itemIndex,
  [PLAYER_G_CURRENT_ITEM]: (state) => (index) => state.items[index],

  [PLAYER_G_PINEDS]: (state) => state.pineds,
  [PLAYER_G_PINEDS_LENGTH]: (state) => state.pineds.length,
  [PLAYER_G_CURRENT_PINED_ITEM_INDEX]: (state) => state.pinedIndex,
  [PLAYER_G_CURRENT_PINED_ITEM]: (state) => (index) => state.pineds[index],

  [PLAYER_G_PINED_INDEX]: (state) => (item) => state.pineds.findIndex(
    (p) => p.item.src === item.src,
  ),

  [PLAYER_G_FETCH_NEXT_FROM]: (state) => state.fetchNextFrom,

  [PLAYER_G_IS_FETCH_NEXT_FROM_ITEMS]: (state) => state.fetchNextFrom === FETCH_FROM_ITEMS,
  [PLAYER_G_IS_FETCH_NEXT_FROM_PINEDS]: (state) => state.fetchNextFrom === FETCH_FROM_PINEDS,

};

const mutations = {
  [PLAYER_M_SET_CURRENT_ITEM_INDEX] (state, index) { Vue.set(state, 'itemIndex', index) },

  [PLAYER_M_SET_CURRENT_PINED_INDEX] (state, index) { Vue.set(state, 'pinedIndex', index) },

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

  [PLAYER_M_ADD_ITEM_TO_PINEDS] (state, item) {
    state.pineds.push({ item });
  },

  [PLAYER_M_REMOVE_ITEM_TO_PINEDS] (state, index) {
    const pineds = state.pineds.filter((v, i) => i !== index);
    Vue.set(state, 'pineds', pineds);
  },

  [PLAYER_M_CLEAR_PINEDS] (state) {
    Vue.set(state, 'pineds', []);
    Vue.set(state, 'pinedIndex', -1);
  },

  setItems (state, items) {
    Vue.set(state, 'items', items);
    Vue.set(state, 'itemIndex', -1);
  },

  clearItems (state) {
    Vue.set(state, 'items', []);
    Vue.set(state, 'itemIndex', -1);
  },

  /**
   * Set index of the item (item model)
   */
  setItemIndex (state, { index, arrayName }) {
    Vue.set(state[arrayName][index].item, 'index', index);
  },

  setFetchNextFrom (state, value) { Vue.set(state, 'fetchNextFrom', value) },
};

// TODO: Feature: Add fetch items from bdd with tags and types. DONE ?
// TODO: Bug: Backend: getimagesize raize warning in call response body that
//                     trigger json.parse to fail. Should be added to the
//                     response object as error.
const actions = {
  async [PLAYER_A_FETCH_NEXT] ({ state, rootGetters, commit }) {
    const { fetchNextFrom } = state;
    let result;

    const fetchItemRandomly = rootGetters[
      `${PLAYER_OPTS_PLAYER_NS}/${PLAYER_OPTS_PLAYER_G_FETCH_ITEM_RANDOMLY}`
    ];

    try {
      if (fetchNextFrom === FETCH_FROM_ITEMS
        || fetchNextFrom === FETCH_FROM_PINEDS
      ) {
        let index;
        let el;
        let items;
        let itemIndex;
        let arrayName;

        if (fetchNextFrom === FETCH_FROM_ITEMS) {
          items = state.items;
          itemIndex = state.itemIndex;
          arrayName = 'items';
        } else if (fetchNextFrom === FETCH_FROM_PINEDS) {
          items = state.pineds;
          itemIndex = state.pinedIndex;
          arrayName = 'pineds';
        }

        if (fetchItemRandomly) {
          const obj = getRandomElementWithIndex(items);
          el = obj.el;
          index = obj.index;
        } else {
          index = itemIndex + 1;
          if (index >= items.length) {
            index = 0;
          }
          el = items[index];
        }

        result = el;
        // Set the index of the item into the items list.
        commit('setItemIndex', { index, arrayName });
      } else if (fetchNextFrom === FETCH_FROM_RANDOM) {
        result = await fetchRandomItem({
          folders: rootGetters[`${PLAYER_OPTS_SRC_NS}/${PLAYER_OPTS_SRC_G_FOLDERS}`],
        });
      } else {
        throw new Error(`Invalid state.fetchNextFrom:"${fetchNextFrom}"`);
      }
    } catch (e) {
      const error = buildError(e);
      commit(PLAYER_M_ADD_ERROR, { actionName: PLAYER_A_FETCH_NEXT, error });
      throw error;
    }

    return result.item;
  },

  async [PLAYER_A_FETCH_PREVIOUS] ({
    state, rootGetters, commit, dispatch,
  }) {
    const { fetchNextFrom } = state;
    let result;

    const fetchItemRandomly = rootGetters[
      `${PLAYER_OPTS_PLAYER_NS}/${PLAYER_OPTS_PLAYER_G_FETCH_ITEM_RANDOMLY}`
    ];

    try {
      if ((fetchNextFrom === FETCH_FROM_ITEMS
          || fetchNextFrom === FETCH_FROM_PINEDS)
        && !fetchItemRandomly
      ) {
        let index;
        let items;
        let itemIndex;
        let arrayName;

        if (fetchNextFrom === FETCH_FROM_ITEMS) {
          items = state.items;
          itemIndex = state.itemIndex;
          arrayName = 'items';
        } else if (fetchNextFrom === FETCH_FROM_PINEDS) {
          items = state.pineds;
          itemIndex = state.pinedIndex;
          arrayName = 'pineds';
        }

        index = itemIndex - 1;
        if (index < 0) {
          index = items.length - 1;
        }

        result = items[index];
        // Set the index of the item into the items list.
        commit('setItemIndex', { index, arrayName });
      } else {
        result = {};
        result.item = await dispatch(PLAYER_A_FETCH_NEXT);
      }
    } catch (e) {
      const error = buildError(e);
      commit(PLAYER_M_ADD_ERROR, { actionName: PLAYER_A_FETCH_PREVIOUS, error });
      throw error;
    }

    return result.item;
  },

  [PLAYER_A_FETCH_ITEMS_FROM_RANDOM] ({ commit }) {
    commit('clearItems');
    commit('setFetchNextFrom', FETCH_FROM_RANDOM);
    return Promise.resolve();
  },

  async [PLAYER_A_FETCH_ITEMS_FROM_BDD] ({ rootGetters, commit }) {
    let items;
    const playerOptsSrcGetter = (g) => rootGetters[`${PLAYER_OPTS_SRC_NS}/${g}`];

    const tags = playerOptsSrcGetter(PLAYER_OPTS_SRC_G_TAGS);
    const tagsOperator = playerOptsSrcGetter(PLAYER_OPTS_SRC_G_TAGS_OPERATOR);
    const fileTypes = playerOptsSrcGetter(PLAYER_OPTS_SRC_G_FILE_TYPES);

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

  [PLAYER_A_FETCH_ITEMS_FROM_PINEDS] ({ commit }) {
    commit('setFetchNextFrom', FETCH_FROM_PINEDS);
    commit(PLAYER_M_SET_CURRENT_PINED_INDEX, -1);
    return Promise.resolve();
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
