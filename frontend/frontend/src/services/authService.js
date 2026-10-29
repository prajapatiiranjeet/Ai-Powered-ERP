import { apiRequest } from './api.js';
import { STORAGE_KEYS, ROLES, normalizeRole } from '../utils/constants.js';
import { studentService } from './studentService.js';
import { isTokenValid } from '../utils/jwt.js';
import { facultyService } from './facultyService.js';

export async function login(email, password) {
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    auth: false,
    body: { email, password },
    timeoutMs: 20000
  });

  const token = typeof response?.jwt === 'string' ? response.jwt.trim() : '';
  const role = normalizeRole(response?.role);
  if (!token || !isTokenValid(token)) throw new Error('The server returned an invalid or expired sign-in token. Please try again.');
  if (!role) throw new Error('The server did not return a recognized account role. Please contact your administrator.');

  try {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    if (response.id !== undefined && response.id !== null) localStorage.setItem(STORAGE_KEYS.USER_ID, String(response.id));
    localStorage.setItem(STORAGE_KEYS.EMAIL, response.email || email);
    if (response.name) localStorage.setItem(STORAGE_KEYS.NAME, response.name);
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
  } catch {
    logout();
    throw new Error('Your browser could not save the sign-in session. Check its storage settings and try again.');
  }

  return { id: response.id ?? null, jwt: token, role };
}

export function logout() {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  } catch { /* Storage can be unavailable in restricted browser contexts. */ }
}

export function getStoredAuth() {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (!token) return null;
  return {
    token,
    userId: localStorage.getItem(STORAGE_KEYS.USER_ID),
    email: localStorage.getItem(STORAGE_KEYS.EMAIL),
    role: normalizeRole(localStorage.getItem(STORAGE_KEYS.ROLE)),
    name: localStorage.getItem(STORAGE_KEYS.NAME)
  };
}

export async function refreshUserName() {
  const role = normalizeRole(localStorage.getItem(STORAGE_KEYS.ROLE));
  try {
    if (role === ROLES.STUDENT) {
      const profile = await studentService.viewProfile();
      const name = profile?.fullName || profile?.name;
      if (name) localStorage.setItem(STORAGE_KEYS.NAME, name);
    } else if (role === ROLES.FACULTY) {
      const profile = await facultyService.viewProfile();
      const name = profile?.fullName || profile?.name;
      if (name) localStorage.setItem(STORAGE_KEYS.NAME, name);
    }
  } catch { /* Profile refresh should not end an otherwise valid session. */ }
}
