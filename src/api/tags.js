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

/**
 * Edit a category.
 * TODO: refactor by spliting to Add | Edit | Delete API.
 * @param {object}  options            - Options.
 * @param {boolean} [options.isNew]    - Is a new tag.
 * @param {boolean} [options.isDelete] - Should delete tag.
 * @param {string}  options.id         - Category id.
 * @param {string}  [options.name]     - Category name.
 * @param {string}  [options.color]    - Category color.
 * @returns {Promise<object>} - Response object
 *          {boolean} obj.success
 *          {string}  obj.tagCategoryId
 */
const editCategory = async ({
  isNew, isDelete, id, name, color,
}) => {
  let json;

  try {
    const url = `${BASE_URL}/api/editTagCategory`;

    const opts = {
      method: 'POST', // TODO: should be a PUT for update and DELETE for a delete ?
      body: JSON.stringify({
        isNew,
        isDelete,
        id,
        name,
        color,
      }),
    };

    json = await fetchJson(url, opts);
  } catch (error) {
    throw buildError(error);
  }

  return json;
};

/**
 * Add a new category.
 * @param {object} options       - Options.
 * @param {string} options.name  - Category name.
 * @param {string} options.color - Category color.
 * @returns {Promise<string>} - Category id
 */
export const addCategory = async ({ name, color }) => {
  if (!name || !color) {
    throw buildError('Missing "name" or "color" options to add a new category.');
  }

  let categoryId = '';

  try {
    const response = await editCategory({
      name, color, isNew: true,
    });
    categoryId = response.tagCategoryId;
  } catch (error) {
    throw buildError(error);
  }

  return categoryId;
};

/**
 * Edit an existing category.
 * @param {object} options         - Options.
 * @param {string} options.id      - Category id.
 * @param {string} options.name    - Category name.
 * @param {string} [options.color] - Category color.
 * @returns {Promise<boolean>} - Success or failure.
 */
export const updateCategory = async ({ id, name, color }) => {
  if (!id || !name || !color) {
    throw buildError('Missing "id" or "name" or "color" options to edit a category.');
  }

  let success = false;

  try {
    const response = await editCategory({ id, name, color });
    success = response.success;
  } catch (error) {
    throw buildError(error);
  }

  return success;
};

/**
 * Delete a category.
 * @param {object} options    - Options.
 * @param {string} options.id - Category id.
 * @returns {Promise<boolean>} - Success or failure.
 */
export const deleteCategory = async ({ id }) => {
  if (!id) {
    throw buildError('Missing "id" options to delete category.');
  }

  let success = false;

  try {
    const response = await editCategory({ id, isDelete: true });
    success = response.success;
  } catch (error) {
    throw buildError(error);
  }

  return success;
};
