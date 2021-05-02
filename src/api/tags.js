import {
  BASE_URL,
  buildError,
  fetchJson,
} from './api';

/**
 * Fetch list of tags.
 * @returns {Promise<object[]>}
 */
export const fetchTags = async () => {
  let tags = [];

  try {
    const url = `${BASE_URL}/api/getAllTags`;

    const opts = {
      method: 'POST', // TODO: should be a GET ?
    };

    const json = await fetchJson(url, opts);
    tags = json.tags || [];
  } catch (error) {
    throw buildError(error);
  }

  return tags;
};

/**
 * Fetch list of categories (tags categories).
 * @returns {Promise<object[]>}
 */
export const fetchCategories = async () => {
  let categories = [];
  try {
    const url = `${BASE_URL}/api/getAllTagCategories`;

    const opts = {
      method: 'POST', // TODO: should be a GET ?
    };

    const json = await fetchJson(url, opts);
    categories = json.tagCategories || [];
  } catch (error) {
    throw buildError(error);
  }

  return categories;
};
