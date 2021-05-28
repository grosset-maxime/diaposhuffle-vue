export const BASE_URL = process.env.VUE_APP_BASE_URL || '';

export const ERROR_SEVERITY_ERROR = 'error';
export const ERROR_SEVERITY_WARN = 'warning';
export const ERROR_SEVERITY_INFO = 'info';

export const buildError = (e) => {
  let error = e;
  let publicMessage;
  let message;
  let severity = ERROR_SEVERITY_ERROR;

  if (typeof error === 'string') {
    error = { message: error, publicMessage: error };
  }

  try {
    message = error.message || error.toString();
    publicMessage = error.publicMessage || error.toString();
    severity = error.severity || ERROR_SEVERITY_ERROR;
  } catch (er) {
    message = er.toString();
    publicMessage = er.toString();
    severity = error.severity || ERROR_SEVERITY_ERROR;
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
