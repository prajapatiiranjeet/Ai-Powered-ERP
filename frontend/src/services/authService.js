import { apiRequest } from './api.js';
import { STORAGE_KEYS, ROLES } from '../utils/constants.js';
import { decodeJwtPayload } from '../utils/jwt.js';
import { adminService } from './adminService.js';
import { studentService } from './studentService.js';

export async function login(email, password) {
  const res = await apiRequest('/auth/login', {
    method: 'POST',
    auth: false,
    body: { email, password }
  });

  const { id, jwt } = res || {};
  if (!jwt) throw new Error('Invalid login response');

  localStorage.setItem(STORAGE_KEYS.TOKEN, jwt);
  if (id) localStorage.setItem(STORAGE_KEYS.USER_ID, String(id));

  const payload = decodeJwtPayload(jwt);
  if (payload?.sub) localStorage.setItem(STORAGE_KEYS.EMAIL, payload.sub);

  const role = await detectRole();
  return { id, jwt, role };
}

export function logout() {
  Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
}

export function getStoredAuth() {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (!token) return null;
  return {
    token,
    userId: localStorage.getItem(STORAGE_KEYS.USER_ID),
    email: localStorage.getItem(STORAGE_KEYS.EMAIL),
    role: localStorage.getItem(STORAGE_KEYS.ROLE),
    name: localStorage.getItem(STORAGE_KEYS.NAME)
  };
}

export async function detectRole() {
  try {
    await adminService.getAllStudents();
    localStorage.setItem(STORAGE_KEYS.ROLE, ROLES.ADMIN);
    return ROLES.ADMIN;
  } catch (_) {
    // not admin
  }

  try {
    const profile = await studentService.viewProfile();
    localStorage.setItem(STORAGE_KEYS.ROLE, ROLES.STUDENT);
    if (profile?.name) localStorage.setItem(STORAGE_KEYS.NAME, profile.name);
    return ROLES.STUDENT;
  } catch (_) {
    // not student
  }

  localStorage.setItem(STORAGE_KEYS.ROLE, ROLES.FACULTY);
  return ROLES.FACULTY;
}

export async function refreshUserName() {
  const role = localStorage.getItem(STORAGE_KEYS.ROLE);
  try {
    if (role === ROLES.STUDENT) {
      const p = await studentService.viewProfile();
      if (p?.name) localStorage.setItem(STORAGE_KEYS.NAME, p.name);
    }
  } catch (_) { /* ignore */ }
}
