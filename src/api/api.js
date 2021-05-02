export const BASE_URL = process.env.VUE_APP_BASE_URL || '';

export const buildError = (e) => {
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
};

export const getHeaders = () => ({
  Accept: 'application/json',
  'Content-Type': 'application/json',
});

export const fetchJson = async (url, opts) => {
  const headersOpts = { headers: getHeaders() };
  const response = await fetch(url, { ...opts, ...headersOpts });
  const json = await response.json();

  if (json.error) { throw buildError(json.error) }

  return json;
};
