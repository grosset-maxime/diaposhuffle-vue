export const wait = (time) => new Promise((resolve) => {
  setTimeout(resolve, time);
});

export const getHeaders = () => ({
  Accept: 'application/json',
  'Content-Type': 'application/json',
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
