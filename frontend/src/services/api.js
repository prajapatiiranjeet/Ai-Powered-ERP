import { STORAGE_KEYS, ROUTES } from '../utils/constants.js';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

function getToken() {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

function clearAuthAndRedirect() {
  Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  if (typeof window !== 'undefined' && window.location.pathname !== ROUTES.LOGIN) {
    window.location.href = ROUTES.LOGIN;
  }
}

export async function apiRequest(url, { method = 'GET', body, auth = true, headers = {} } = {}) {
  const reqHeaders = { ...headers };

  if (body !== undefined) {
    reqHeaders['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = getToken();
    if (token) {
      reqHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const options = { method, headers: reqHeaders };
  if (body !== undefined) {
    options.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(url, options);
  } catch (networkErr) {
    throw new Error('Unable to reach server. Please check your connection.');
  }

  if (res.status === 401) {
    clearAuthAndRedirect();
    throw new Error('Session expired. Please sign in again.');
  }
  if (res.status === 403) {
    throw new Error('Access denied.');
  }

  const contentType = res.headers.get('content-type') || '';
  let data = null;
  try {
    data = contentType.includes('application/json') ? await res.json() : await res.text();
  } catch (_parseErr) {
    data = null;
  }

  if (!res.ok) {
    const msg =
      (typeof data === 'object' && data?.message) ||
      (typeof data === 'string' && data.length < 200 ? data : null) ||
      `Request failed (HTTP ${res.status})`;
    throw new Error(msg);
  }

  return data;
}
