/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
import Vue from 'vue';
import { getHeaders } from '../../utils/utils';
import {
  FOLDER_BROWSER_G_FOLDERS,
  FOLDER_BROWSER_M_ADD_ERROR,
  FOLDER_BROWSER_A_FETCH_FOLDERS,
} from '../types';

const BASE_URL = process.env.VUE_APP_BASE_URL || '';

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
    const folders = getters[FOLDER_BROWSER_G_FOLDERS];
    const folder = folders.pathes[path || '/'];

    if (folder && folder.fetched) {
      return folders;
    }

    commit('_setFetching', { folder, path, isFetching: true });

    const url = `${BASE_URL}/api/getFolderList`;
    const opts = {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        folder: path,
      }),
    };

    const onError = (error) => {
      commit(FOLDER_BROWSER_M_ADD_ERROR, {
        actionName: FOLDER_BROWSER_A_FETCH_FOLDERS, error,
      });
      return error;
    };

    const response = await fetch(url, opts)
      .then((response) => response.json().then((json) => {
        if (json.success) {
          const children = json.folderList;
          commit('_setChildren', { folder, path, children });
        }

        if (json.error) { onError(json) }

        return getters[FOLDER_BROWSER_G_FOLDERS];
      }))
      .catch((error) => onError({ error: true, publicMessage: error.toString() }))
      .finally(() => {
        commit('_setFetching', { folder, path, isFetching: false });
      });

    return response;
  },

  // async [PLAYER_A_DELETE_ITEM] ({ commit }, itemSrc) {
  //   const url = `${BASE_URL}/api/deletePic`;
  //   const opts = {
  //     method: 'POST',
  //     headers: getHeaders(),
  //     body: JSON.stringify({
  //       picPath: itemSrc,
  //       continueIfNotExist: false,
  //       deleteOnlyFromBdd: false,
  //     }),
  //   };

  //   const onError = (error) => {
  //     commit(PLAYER_M_ADD_ERROR, { actionName: PLAYER_A_DELETE_ITEM, error });
  //     return error;
  //   };

  //   const response = await fetch(url, opts)
  //     .then((response) => response.json().then((json) => {
  //       if (json.error) { onError(json) }
  //       return json;
  //     }))
  //     .catch((error) => onError({ error: true, publicMessage: error.toString() }));

  //   return response;
  // },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
