/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
// import Vue from 'vue';
import { getHeaders } from '../../utils/utils';
import {
  TAGGER_G_TAGS,
  TAGGER_G_TAGS_LIST,
  TAGGER_G_CATEGORIES,
  TAGGER_G_CATEGORIES_LIST,
  TAGGER_G_CATEGORY,
  TAGGER_G_CATEGORY_COLOR,
  TAGGER_M_ADD_ERROR,
  TAGGER_A_FETCH_TAGS,
  TAGGER_A_FETCH_CATEGORIES,
} from '../types';

const BASE_URL = process.env.VUE_APP_BASE_URL || '';

const state = () => ({
  tagsFetched: false,
  tags: {},

  categoriesFetched: false,
  categories: {},

  errors: [],
});

const getters = {
  [TAGGER_G_TAGS]: (state) => state.tags,

  [TAGGER_G_TAGS_LIST]: (state) => Object.keys(state.tags).map((id) => state.tags[id]),

  [TAGGER_G_CATEGORIES]: (state) => state.categories,

  [TAGGER_G_CATEGORIES_LIST]: (state) => Object.keys(state.categories).map(
    (id) => state.categories[id],
  ),

  [TAGGER_G_CATEGORY]: (state) => (id) => state.categories[id],

  [TAGGER_G_CATEGORY_COLOR]: (state) => (id) => {
    if (!id) { return undefined }

    const category = state.categories[id];
    return category ? category.color : undefined;
  },
};

const mutations = {
  [TAGGER_M_ADD_ERROR] (state, { actionName, error }) {
    const e = {};
    e[actionName] = error;
    state.errors.push(e);
    // eslint-disable-next-line no-console
    console.error(actionName, error);
  },

  _setTagsFetched (state, value) { state.tagsFetched = value },

  _setCategoriesFetched (state, value) { state.categoriesFetched = value },

  _setTags (state, tags) {
    tags.forEach((tag) => {
      state.tags[tag.id] = tag;
    });
  },

  _setCategories (state, categories) {
    categories.forEach((cat) => {
      state.categories[cat.id] = cat;
    });
  },
};

const actions = {

  async [TAGGER_A_FETCH_TAGS] ({ state, commit, getters }) {
    if (state.tagsFetched) {
      return getters[TAGGER_G_TAGS];
    }

    const url = `${BASE_URL}/api/getAllTags`;
    const opts = {
      method: 'POST', // TODO: should be a GET ?
      headers: getHeaders(),
    };

    const onError = (error) => {
      commit(TAGGER_M_ADD_ERROR, {
        actionName: TAGGER_A_FETCH_TAGS, error,
      });
      return error;
    };

    const response = await fetch(url, opts)
      .then((response) => response.json().then((json) => {
        if (json.success) {
          const { tags } = json;
          commit('_setTags', tags);
        }

        if (json.error) { onError(json) }

        return getters[TAGGER_G_TAGS];
      }))
      .catch((error) => onError({ error: true, publicMessage: error.toString() }))
      .finally(() => {
        commit('_setTagsFetched', true);
      });

    return response;
  },

  async [TAGGER_A_FETCH_CATEGORIES] ({ state, commit, getters }) {
    if (state.categoriesFetched) {
      return getters[TAGGER_G_CATEGORIES];
    }

    const url = `${BASE_URL}/api/getAllTagCategories`;
    const opts = {
      method: 'POST', // TODO: should be a GET ?
      headers: getHeaders(),
    };

    const onError = (error) => {
      commit(TAGGER_M_ADD_ERROR, {
        actionName: TAGGER_A_FETCH_CATEGORIES, error,
      });
      return error;
    };

    const response = await fetch(url, opts)
      .then((response) => response.json().then((json) => {
        if (json.success) {
          const categories = json.tagCategories;
          commit('_setCategories', categories);
        }

        if (json.error) { onError(json) }

        return getters[TAGGER_G_CATEGORIES];
      }))
      .catch((error) => onError({ error: true, publicMessage: error.toString() }))
      .finally(() => {
        commit('_setCategoriesFetched', true);
      });

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
