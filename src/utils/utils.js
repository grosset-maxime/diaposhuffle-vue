export const SHAKE_ANIMATION_TIME = 830;

export const wait = (time) => new Promise((resolve) => {
  setTimeout(resolve, time);
});

export const getKey = (event) => {
  let { key } = event;
  const { code } = event;
  if (code === 'Space') {
    key = 'Space';
  }
  return key;
};

export const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

export const isEmptyObj = (obj) => {
  if (typeof obj !== 'object') { return true }
  return Object.keys(obj).length === 0;
};

/**
 * Get a random number between min and max (included).
 * @param {number} a - Min integer. If no b provided so min = 0 and max = a.
 * @param {number} [b] - Max integer.
 * @returns {number} - Random number.
 */
export const getRandomNum = (a, b) => {
  let min = 0;
  let max = 0;

  if (!b) {
    max = a;
  } else {
    min = a;
    max = b;
  }

  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Get a random element of an array and the random index of this element.
 * @param {Array<any>} array - Array to get a random element.
 * @returns {object} - Result.
 *          {number} obj.index
 */
export const getRandomElementWithIndex = (array = []) => {
  if (!array.length) { return undefined }

  const index = getRandomNum(array.length - 1);
  const el = array[index];

  return { index, el };
};

/**
 * Get a random element of an array.
 * @param {Array<any>} array - Array to get a random element.
 * @returns {Any} - Random element.
 */
export const getRandomElement = (array = []) => getRandomElementWithIndex(array)?.el;
