import { STORAGE_KEYS, ROUTES } from '../utils/constants.js';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

function getToken() {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

function clearAuthAndRedirect() {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  if (typeof window !== 'undefined' && window.location.pathname !== ROUTES.LOGIN) {
    window.location.replace(ROUTES.LOGIN);
  }
}

export async function apiRequest(url, { method = 'GET', body, auth = true, headers = {}, timeoutMs = 20000 } = {}) {
  const requestHeaders = { ...headers };
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const isTextBody = typeof body === 'string' && requestHeaders['Content-Type'] === 'text/plain';

  if (body !== undefined && !isFormData && !requestHeaders['Content-Type']) requestHeaders['Content-Type'] = 'application/json';
  if (auth) {
    const token = getToken();
    if (token) requestHeaders.Authorization = `Bearer ${token}`;
  }

  const options = { method, headers: requestHeaders };
  if (body !== undefined) options.body = isFormData || isTextBody || typeof body === 'string' ? body : JSON.stringify(body);

  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = timeoutMs > 0 ? setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs) : null;
  options.signal = controller.signal;

  try {
    let response;
    const requestUrl = API_BASE_URL && url.startsWith('/') ? `${API_BASE_URL}${url}` : url;
    try {
      response = await fetch(requestUrl, options);
    } catch (error) {
      if (error?.name === 'AbortError') throw new Error(timedOut ? 'The server took too long to respond. Please retry.' : 'The request was cancelled.');
      throw new Error('Unable to reach server. Please check your connection.');
    }

    if (response.status === 401) {
      clearAuthAndRedirect();
      const error = new Error('Session expired. Please sign in again.');
      error.status = 401;
      throw error;
    }
    if (response.status === 403) {
      const error = new Error('Access denied. Your account is not authorized for this action.');
      error.status = 403;
      throw error;
    }

    const contentType = response.headers.get('content-type') || '';
    let data = null;
    try {
      data = contentType.includes('application/json') ? await response.json() : await response.text();
    } catch (error) {
      if (error?.name === 'AbortError' || timedOut) throw new Error('The server took too long to respond. Please retry.');
      if (response.ok && response.status !== 204) throw new Error('The server returned an unreadable response. Please retry.');
    }
    if (timedOut) throw new Error('The server took too long to respond. Please retry.');

    if (!response.ok) {
      const message = (typeof data === 'object' && data?.message) || (typeof data === 'string' && data.length < 200 ? data : null) || `Request failed (HTTP ${response.status})`;
      const error = new Error(message);
      error.status = response.status;
      throw error;
    }
    return data;
  } finally {
    if (timeoutId !== null) clearTimeout(timeoutId);
  }
}
