// eslint-disable-next-line import/prefer-default-export
export const wait = (time) => new Promise((resolve) => {
  setTimeout(resolve, time);
});

export const getHeaders = () => ({
  Accept: 'application/json',
  'Content-Type': 'application/json',
});
