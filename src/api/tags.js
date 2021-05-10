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

/**
 * Edit a tag.
 * TODO: refactor by spliting to Add | Edit | Delete API.
 * @param {object}  options            - Options.
 * @param {boolean} [options.isNew]    - Is a new tag.
 * @param {boolean} [options.isDelete] - Should delete tag.
 * @param {string}  options.id         - Tag id.
 * @param {string}  [options.name]     - Tag name.
 * @param {string}  [options.category] - Tag category id.
 * @returns {Promise<boolean>} - Success or failure.
 */
const editTag = async ({
  isNew, isDelete, id, name, category,
}) => {
  if (!id) {
    throw buildError('Missing id tag information to edit tag.');
  }

  let success = false;

  try {
    const url = `${BASE_URL}/api/editTag`;

    const opts = {
      method: 'POST', // TODO: should be a PUT for update and DELETE for a delete ?
      body: JSON.stringify({
        isNew,
        isDelete,
        id,
        name,
        category,
      }),
    };

    const json = await fetchJson(url, opts);
    success = !!json.success;
  } catch (error) {
    throw buildError(error);
  }

  return success;
};

/**
 * Add a new tag.
 * @param {object} options            - Options.
 * @param {string} options.id         - Tag id.
 * @param {string} options.name       - Tag name.
 * @param {string} [options.category] - Tag category id.
 * @returns {Promise<boolean>} - Success or failure.
 */
export const addTag = async ({ id, name, category }) => {
  if (!id || !name) {
    throw buildError('Missing "id" or "name" options to add a new tag.');
  }

  let success = false;

  try {
    success = await editTag({
      id, name, category, isNew: true,
    });
  } catch (error) {
    throw buildError(error);
  }

  return success;
};

/**
 * Edit an existing tag.
 * @param {object} options            - Options.
 * @param {string} options.id         - Tag id.
 * @param {string} options.name       - Tag name.
 * @param {string} [options.category] - Tag category id.
 * @returns {Promise<boolean>} - Success or failure.
 */
export const updateTag = async ({ id, name, category }) => {
  if (!id || !name) {
    throw buildError('Missing "id" or "name" options to edit a tag.');
  }

  let success = false;

  try {
    success = await editTag({ id, name, category });
  } catch (error) {
    throw buildError(error);
  }

  return success;
};

/**
 * Delete a tag.
 * @param {object} options    - Options.
 * @param {string} options.id - Tag id.
 * @returns {Promise<boolean>} - Success or failure.
 */
export const deleteTag = async ({ id }) => {
  if (!id) {
    throw buildError('Missing "id" options to delete tag.');
  }

  let success = false;

  try {
    success = await editTag({ id, isDelete: true });
  } catch (error) {
    throw buildError(error);
  }

  return success;
};
