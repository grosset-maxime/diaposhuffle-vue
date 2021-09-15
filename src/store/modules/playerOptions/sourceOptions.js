/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
import Vue from 'vue';
import {
  PLAYER_OPTS_SRC_G_AVAILABLE_FILE_TYPES,
  PLAYER_OPTS_SRC_G_FOLDERS,
  PLAYER_OPTS_SRC_G_TAGS,
  PLAYER_OPTS_SRC_G_HAS_TAGS,
  PLAYER_OPTS_SRC_G_TAGS_OPERATOR,
  PLAYER_OPTS_SRC_G_FILE_TYPES,
  PLAYER_OPTS_SRC_G_HAS_FILE_TYPES,
  PLAYER_OPTS_SRC_G_FROM_PINED,

  PLAYER_OPTS_SRC_M_SOURCE_OPTIONS,
  PLAYER_OPTS_SRC_M_TOGGLE_TAGS_OPERATOR,
} from '../../types';

const TAGS_OPERATOR_OR = 'OR';
const TAGS_OPERATOR_AND = 'AND';
const AVAILABLE_FILE_TYPES = ['JPG', 'GIF', 'PNG', 'WEBM', 'MP4', 'MKV'];

const state = () => ({

  folders: [],

  tags: [], // List of selected tags ids.

  tagsOperator: TAGS_OPERATOR_AND,

  fileTypes: [],

  fromPined: false,
});

const getters = {
  [PLAYER_OPTS_SRC_G_AVAILABLE_FILE_TYPES]: () => AVAILABLE_FILE_TYPES,

  [PLAYER_OPTS_SRC_G_FOLDERS]: (state) => state.folders,

  [PLAYER_OPTS_SRC_G_TAGS]: (state) => state.tags,

  [PLAYER_OPTS_SRC_G_HAS_TAGS]: (state) => !!state.tags.length,

  [PLAYER_OPTS_SRC_G_TAGS_OPERATOR]: (state) => state.tagsOperator,

  [PLAYER_OPTS_SRC_G_FILE_TYPES]: (state) => state.fileTypes,

  [PLAYER_OPTS_SRC_G_HAS_FILE_TYPES]: (state) => !!state.fileTypes.length,

  [PLAYER_OPTS_SRC_G_FROM_PINED]: (state) => state.fromPined,
};

const mutations = {
  [PLAYER_OPTS_SRC_M_SOURCE_OPTIONS] (state, sources) {
    Object.keys(sources).forEach((key) => {
      Vue.set(state, key, sources[key]);
    });
  },

  [PLAYER_OPTS_SRC_M_TOGGLE_TAGS_OPERATOR] (state) {
    const operator = state.filters.tagsOperator === TAGS_OPERATOR_OR
      ? TAGS_OPERATOR_AND
      : TAGS_OPERATOR_OR;

    Vue.set(state.filters, 'tagsOperator', operator);
  },
};

const actions = {};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
