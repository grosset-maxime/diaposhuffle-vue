import {
  BASE_URL,
  buildError,
  fetchJson,
} from './api';
import { createItem } from '../models/item';

/**
 * Fetch one random item from file system.
 * @param {object} [options] - Options.
 * @param {string[]} [folders] - Custom folders list.
 * @returns {Promise<object>}
 */
export const fetchRandomItem = async ({ folders } = {}) => {
  let item;

  try {
    const url = `${BASE_URL}/api/getRandomPic`;

    const opts = {
      method: 'POST',
      body: JSON.stringify({
        customFolders: folders,
      }),
    };

    item = await fetchJson(url, opts);
    item.item = createItem(item.pic);
  } catch (error) {
    throw buildError(error);
  }

  return item;
};

/**
 * Fetch list of items matching options from the bdd.
 * @param {object}   [options] - Options.
 * @param {string[]} [options.tags] - Tags id.
 * @param {string[]} [options.types] - Types (JPG, GIF, PNG).
 * @param {string}   [options.tagsOperator] - Operator for tags filtering ('AND' or 'OR').
 * @returns {Promise<object[]>}
 */
export const fetchItemsFromBdd = async ({ tags, tagsOperator, types } = {}) => {
  let items = [];

  try {
    const url = `${BASE_URL}/api/getPicsFromBdd`;

    const opts = {
      method: 'POST',
      body: JSON.stringify({
        tags,
        tagsOperator,
        types,
      }),
    };

    const json = await fetchJson(url, opts);
    items = json.results;
    items = items.map((item) => ({
      ...item,
      item: createItem({
        src: item.path,
        randomPublicPath: item.path,
        name: item.path.split('/')[item.path.split('/').length - 1],
        tags: item.tags.split(';').filter((tag) => tag),
        extension: item.extension,
        // TODO: set type (file type) ?
      }),
    }));
  } catch (error) {
    throw buildError(error);
  }
  return items;
};

/**
 * Delete an item.
 * @param {object} options - Options.
 * @param {string} itemSrc - Item scr.
 * @param {boolean} [ignoreIfNotExist=false] - Continue delete script if item
 *                                             doesn't exist in file system.
 * @param {boolean} [fromBddOnly=false] - Delete item only from the bdd,
 *                                        do not remove it from file system.
 * @returns {Promise<object>}
 * {boolean} obj.success -
 */
export const deleteItem = async ({
  itemSrc,
  ignoreIfNotExist = false,
  fromBddOnly = false,
}) => {
  if (!itemSrc) { throw buildError('Missing mandatory options.') }

  let response;

  try {
    const url = `${BASE_URL}/api/deletePic`;
    const opts = {
      method: 'POST',
      body: JSON.stringify({
        picPath: itemSrc,
        continueIfNotExist: ignoreIfNotExist,
        deleteOnlyFromBdd: fromBddOnly,
      }),
    };

    response = await fetchJson(url, opts);
  } catch (error) {
    throw buildError(error);
  }

  return response;
};
