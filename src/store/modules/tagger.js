/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
// import Vue from 'vue';
import { fetchTags, fetchCategories } from '../../api/api';
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
    state.tags = Object.fromEntries(tags.map((tag) => [tag.id, tag]));
  },

  _setCategories (state, categories) {
    state.categories = Object.fromEntries(categories.map((cat) => [cat.id, cat]));
  },
};

const actions = {

  async [TAGGER_A_FETCH_TAGS] ({ state, commit, getters }) {
    let tags = getters[TAGGER_G_TAGS];

    if (state.tagsFetched) {
      return tags;
    }

    try {
      tags = await fetchTags();
      commit('_setTags', tags);
    } catch (error) {
      commit(TAGGER_M_ADD_ERROR, {
        actionName: TAGGER_A_FETCH_TAGS, error,
      });
    }

    commit('_setTagsFetched', true);

    return getters[TAGGER_G_TAGS];
  },

  async [TAGGER_A_FETCH_CATEGORIES] ({ state, commit, getters }) {
    let categories = getters[TAGGER_G_CATEGORIES];

    if (state.categoriesFetched) {
      return categories;
    }

    try {
      categories = await fetchCategories();
      commit('_setCategories', categories);
    } catch (error) {
      commit(TAGGER_M_ADD_ERROR, {
        actionName: TAGGER_A_FETCH_TAGS, error,
      });
    }

    commit('_setCategoriesFetched', true);

    return getters[TAGGER_G_CATEGORIES];
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
