/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
import Vue from 'vue';
import { getFolders } from '../../api/folders';
import {
  FOLDER_BROWSER_G_FOLDERS,
  FOLDER_BROWSER_M_ADD_ERROR,
  FOLDER_BROWSER_A_FETCH_FOLDERS,
} from '../types';

const findFolder = (folder, pathParts, level = 0) => {
  if (level >= pathParts.length) {
    return folder;
  }

  const child = folder.children.find(
    (folder) => folder.name === pathParts[level],
  );

  if (child) {
    return findFolder(child, pathParts, level + 1);
  }

  return folder;
};

const state = () => ({
  folders: {
    pathes: {},
    root: true,
    children: [],
    fetched: false,
    fetching: false,
  },
  error: [],
});

const getters = {
  [FOLDER_BROWSER_G_FOLDERS]: (state) => state.folders,
};

const mutations = {
  _setFetching (state, { folder, path = '', isFetching = false }) {
    if (!folder) {
      folder = findFolder(
        state.folders,
        path.split('/').filter((s) => s),
      );
    }

    Vue.set(folder, 'fetching', isFetching);
  },

  _setChildren (state, { folder, path = '', children = [] }) {
    if (!folder) {
      folder = findFolder(
        state.folders,
        path.split('/').filter((s) => s),
      );
    }

    Vue.set(state.folders.pathes, folder.path || '/', folder);

    Vue.set(folder, 'fetched', true);
    Vue.set(folder, 'fetching', true);

    children.forEach((childName) => {
      const childPath = `${path}/${childName}`;
      const child = {
        name: childName,
        path: childPath,
        children: [],
        fetched: false,
      };

      Vue.set(state.folders.pathes, childPath, child);

      folder.children.push(child);
    });
  },
};

const actions = {

  async [FOLDER_BROWSER_A_FETCH_FOLDERS] ({ commit, getters }, path = '') {
    let children;
    const folders = getters[FOLDER_BROWSER_G_FOLDERS];
    const folder = folders.pathes[path || '/'];

    if (folder && folder.fetched) {
      return folders;
    }

    commit('_setFetching', { folder, path, isFetching: true });

    try {
      children = await getFolders({ path });
      commit('_setChildren', { folder, path, children });
    } catch (error) {
      commit(FOLDER_BROWSER_M_ADD_ERROR, {
        actionName: FOLDER_BROWSER_A_FETCH_FOLDERS, error,
      });
    }

    commit('_setFetching', { folder, path, isFetching: false });

    return getters[FOLDER_BROWSER_G_FOLDERS];
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
