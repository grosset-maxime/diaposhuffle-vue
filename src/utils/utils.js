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
