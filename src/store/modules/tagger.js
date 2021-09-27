/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
// import Vue from 'vue';
import Vue from 'vue';
import { buildError } from '../../api/api';
import {
  fetchTags,
  addTag,
  updateTag,
  deleteTag,
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from '../../api/tags';
import {
  TAGGER_G_TAGS,
  TAGGER_G_TAG,
  TAGGER_G_TAGS_LIST,
  TAGGER_G_LAST_USED_TAG_IDS,
  TAGGER_G_CATEGORIES,
  TAGGER_G_CATEGORIES_LIST,
  TAGGER_G_CATEGORY,
  TAGGER_G_CATEGORY_COLOR,

  TAGGER_M_ADD_ERROR,
  TAGGER_M_ADD_LAST_USED_TAG_ID,

  TAGGER_A_FETCH_TAGS,
  TAGGER_A_ADD_TAG,
  TAGGER_A_UPDATE_TAG,
  TAGGER_A_DELETE_TAG,
  TAGGER_A_FETCH_CATEGORIES,
  TAGGER_A_ADD_CATEGORY,
  TAGGER_A_UPDATE_CATEGORY,
  TAGGER_A_DELETE_CATEGORY,
} from '../types';

const state = () => ({
  tagsFetched: false,
  tags: {},

  categoriesFetched: false,
  categories: {},

  lastUsedTagIds: [],

  errors: [],
});

const getters = {
  [TAGGER_G_TAGS]: (state) => state.tags,

  [TAGGER_G_TAG]: (state) => (id) => state.tags[id],

  [TAGGER_G_TAGS_LIST]: (state) => Object.values(state.tags),

  [TAGGER_G_LAST_USED_TAG_IDS]: (state) => state.lastUsedTagIds,

  [TAGGER_G_CATEGORIES]: (state) => state.categories,

  [TAGGER_G_CATEGORIES_LIST]: (state) => Object.values(state.categories),

  [TAGGER_G_CATEGORY]: (state) => (id) => state.categories[id],

  [TAGGER_G_CATEGORY_COLOR]: (state) => (catId) => {
    if (!catId) { return undefined }

    const category = state.categories[catId];
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

  [TAGGER_M_ADD_LAST_USED_TAG_ID] (state, id) {
    const ids = state.lastUsedTagIds.filter((tagId) => tagId !== id);
    ids.unshift(id);
    state.lastUsedTagIds = ids.slice(0, 10);
  },

  _setTagsFetched (state, value) { state.tagsFetched = value },

  _setCategoriesFetched (state, value) { state.categoriesFetched = value },

  _setTags (state, tags) {
    state.tags = Object.fromEntries(tags.map((tag) => [tag.id, tag]));
  },

  _addTag (state, tag) {
    if (!tag.category) { tag.category = '0' }
    Vue.set(state.tags, tag.id, tag);
  },

  _updateTag (state, tag) {
    if (!tag.category) { tag.category = '0' }
    Vue.set(state.tags, tag.id, tag);
  },

  _deleteTag (state, id) { Vue.delete(state.tags, id) },

  _setCategories (state, categories) {
    state.categories = Object.fromEntries(categories.map((cat) => [cat.id, cat]));
  },

  _addCategory (state, category) { Vue.set(state.categories, category.id, category) },

  _updateCategory (state, category) { Vue.set(state.categories, category.id, category) },

  _deleteCategory (state, id) { Vue.delete(state.categories, id) },
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

  async [TAGGER_A_ADD_TAG] ({ commit }, tag) {
    try {
      const success = await addTag({
        id: tag.id,
        name: tag.name,
        category: tag.category,
      });

      if (!success) {
        throw buildError('Fail to add a new tag.');
      }

      commit('_addTag', tag);
    } catch (error) {
      commit(TAGGER_M_ADD_ERROR, {
        actionName: TAGGER_A_ADD_TAG, error,
      });
    }
  },

  async [TAGGER_A_UPDATE_TAG] ({ commit }, tag) {
    try {
      const success = await updateTag({
        id: tag.id,
        name: tag.name,
        category: tag.category,
      });

      if (!success) {
        throw buildError('Fail to update tag.');
      }

      commit('_updateTag', tag);
    } catch (error) {
      commit(TAGGER_M_ADD_ERROR, {
        actionName: TAGGER_A_UPDATE_TAG, error,
      });
    }
  },

  async [TAGGER_A_DELETE_TAG] ({ commit }, id) {
    try {
      const success = await deleteTag({ id });

      if (!success) {
        throw buildError('Fail to delete tag.');
      }

      commit('_deleteTag', id);
    } catch (error) {
      commit(TAGGER_M_ADD_ERROR, {
        actionName: TAGGER_A_DELETE_TAG, error,
      });
    }
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

  async [TAGGER_A_ADD_CATEGORY] ({ commit }, category) {
    try {
      const categoryId = await addCategory({
        name: category.name,
        color: category.color,
      });

      if (!categoryId) {
        throw buildError('Fail to add a new category.');
      }

      category.id = categoryId;
      commit('_addCategory', category);
    } catch (error) {
      commit(TAGGER_M_ADD_ERROR, {
        actionName: TAGGER_A_ADD_CATEGORY, error,
      });
    }
  },

  async [TAGGER_A_UPDATE_CATEGORY] ({ commit }, category) {
    try {
      const success = await updateCategory({
        id: category.id,
        name: category.name,
        color: category.color,
      });

      if (!success) {
        throw buildError('Fail to update category.');
      }

      commit('_updateCategory', category);
    } catch (error) {
      commit(TAGGER_M_ADD_ERROR, {
        actionName: TAGGER_A_UPDATE_CATEGORY, error,
      });
    }
  },

  async [TAGGER_A_DELETE_CATEGORY] ({ commit }, id) {
    try {
      const success = await deleteCategory({ id });

      if (!success) {
        throw buildError('Fail to delete category.');
      }

      commit('_deleteCategory', id);
    } catch (error) {
      commit(TAGGER_M_ADD_ERROR, {
        actionName: TAGGER_A_DELETE_CATEGORY, error,
      });
    }
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
