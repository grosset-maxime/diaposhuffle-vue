import { createItem } from '../models/item';

const BASE_URL = process.env.VUE_APP_BASE_URL || '';

function buildError (e) {
  let error = e;
  let publicMessage;
  let message;
  let severity = 'error';

  if (typeof error === 'string') {
    error = { message: error, publicMessage: error };
  }

  try {
    message = error.message || error.toString();
    publicMessage = error.publicMessage || error.toString();
    severity = error.severity || 'error';
  } catch (er) {
    message = error.toString();
    publicMessage = error.toString();
  }

  return {
    error: true, message, publicMessage, severity,
  };
}

export const getHeaders = () => ({
  Accept: 'application/json',
  'Content-Type': 'application/json',
});

/**
 * Fetch one random item from file system.
 * @param {object} options - Options.
 * @param {string[]} [folders] - Custom folders list.
 * @returns {Promise<object>}
 */
export const fetchRandomItem = async ({ folders }) => {
  const url = `${BASE_URL}/api/getRandomPic`;

  const opts = {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      customFolders: folders,
    }),
  };

  return fetch(url, opts)
    .then((response) => response.json().then((json) => {
      if (json.error) { throw buildError(json.error) }

      const result = json;
      result.item = createItem(json.pic);
      return result;
    }))
    .catch((error) => { throw buildError(error) });
};

/**
 * Fetch list of items matching options from the bdd.
 * @param {object}   options - Options.
 * @param {string[]} [options.tags] - Tags id.
 * @param {string[]} [options.types] - Types (JPG, GIF, PNG).
 * @param {string}   [options.tagsOperator] - Operator for tags filtering ('AND' or 'OR').
 * @returns {Promise<object[]>}
 */
export const fetchItemsFromBdd = async (options = {}) => {
  const url = `${BASE_URL}/api/getPicsFromBdd`;

  const opts = {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      tags: options.tags,
      tagsOperator: options.tagsOperator,
      types: options.types,
    }),
  };

  return fetch(url, opts)
    .then((response) => response.json().then((json) => {
      if (json.error) { throw buildError(json.error) }

      const { results } = json;
      return results;
    }))
    .catch((error) => { throw buildError(error) });
};

/**
 * Delete an item.
 * @param {object} options - Options.
 * @param {string} itemSrc - Item scr.
 * @param {boolean} [continueIfNotExist=false] - Continue delete script if item
 *                                               doesn't exist in file system.
 * @param {boolean} [deleteOnlyFromBdd=false] - Delete item only from the bdd,
 *                                            do not remove it from file system.
 * @returns {Promise<object>}
 * {boolean} obj.success -
 */
export const deleteItem = async ({ itemSrc }) => {
  if (!itemSrc) {
    throw buildError('Missing mandatory options.');
  }

  const url = `${BASE_URL}/api/deletePic`;
  const opts = {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      picPath: itemSrc,
      continueIfNotExist: false,
      deleteOnlyFromBdd: false,
    }),
  };

  return fetch(url, opts)
    .then((response) => response.json().then((json) => {
      if (json.error) { throw buildError(json.error) }
      return json;
    }))
    .catch((error) => { throw buildError(error) });
};

/**
 * Fetch list of tags.
 * @returns {Promise<object[]>}
 */
export const fetchTags = async () => {
  const url = `${BASE_URL}/api/getAllTags`;

  const opts = {
    method: 'POST', // TODO: should be a GET ?
    headers: getHeaders(),
  };

  return fetch(url, opts)
    .then((response) => response.json().then((json) => {
      if (json.error) { throw buildError(json.error) }

      return json.tags || [];
    }))
    .catch((error) => { throw buildError(error) });
};

/**
 * Fetch list of categories (tags categories).
 * @returns {Promise<object[]>}
 */
export const fetchCategories = () => {
  const url = `${BASE_URL}/api/getAllTagCategories`;

  const opts = {
    method: 'POST', // TODO: should be a GET ?
    headers: getHeaders(),
  };

  return fetch(url, opts)
    .then((response) => response.json().then((json) => {
      if (json.error) { throw buildError(json.error) }

      return json.tagCategories || [];
    }))
    .catch((error) => { throw buildError(error) });
};
