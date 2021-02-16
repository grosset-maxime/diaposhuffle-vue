/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
// import Vue from 'vue';
import { getHeaders } from '../../utils/utils';
import {
  TAGGER_G_TAGS,
  TAGGER_M_ADD_ERROR,
  TAGGER_A_FETCH_TAGS,
} from '../types';

const BASE_URL = process.env.VUE_APP_BASE_URL || '';

const state = () => ({
  tagsFetched: false,
  tags: [],
  categories: [],
  errors: [],
});

const getters = {
  [TAGGER_G_TAGS]: (state) => state.tags,
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

  _setTags (state, tags) {
    state.tags = tags;
  },
};

const actions = {

  async [TAGGER_A_FETCH_TAGS] ({ commit, getters }) {
    const tags = getters[TAGGER_G_TAGS];

    if (tags && state.tagsFetched) {
      return tags;
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
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
