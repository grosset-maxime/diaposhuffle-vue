import {
  BASE_URL,
  buildError,
  fetchJson,
} from './api';

/**
 * Get folders name of a folder.
 * @param {object} [options] - Options.
 * @param {string} [path] - Folder path.
 * @returns {Promise<string[]>} - List of folders name.
 */
// eslint-disable-next-line import/prefer-default-export
export const getFolders = async ({ path } = {}) => {
  let folders = [];

  try {
    const url = `${BASE_URL}/api/getFolderList`;
    const opts = {
      method: 'POST',
      body: JSON.stringify({
        folder: path,
      }),
    };

    const json = await fetchJson(url, opts);
    folders = json.folderList;
  } catch (error) {
    throw buildError(error);
  }

  return folders;
};
