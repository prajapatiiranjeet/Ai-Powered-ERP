import { apiRequest } from './api.js';
import { STORAGE_KEYS, ROLES } from '../utils/constants.js';
import { decodeJwtPayload } from '../utils/jwt.js';
import { adminService } from './adminService.js';
import { studentService } from './studentService.js';
import { facultyService } from './facultyService.js';

export async function login(email, password) {
  const res = await apiRequest('/auth/login', {
    method: 'POST',
    auth: false,
    body: { email, password }
  });

  const { id, jwt, role: returnedRole, name, email: returnedEmail } = res || {};
  if (!jwt) throw new Error('Invalid login response');

  localStorage.setItem(STORAGE_KEYS.TOKEN, jwt);
  if (id) localStorage.setItem(STORAGE_KEYS.USER_ID, String(id));
  if (returnedEmail || email) localStorage.setItem(STORAGE_KEYS.EMAIL, returnedEmail || email);
  if (name) localStorage.setItem(STORAGE_KEYS.NAME, name);

  let role = returnedRole;
  if (role === 'STUDENTS') role = 'STUDENT';
  if (role) {
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
  } else {
    role = await detectRole();
  }

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
    const name = profile?.fullName || profile?.name;
    if (name) localStorage.setItem(STORAGE_KEYS.NAME, name);
    return ROLES.STUDENT;
  } catch (_) {
    // not student
  }

  try {
    const profile = await facultyService.viewProfile();
    localStorage.setItem(STORAGE_KEYS.ROLE, ROLES.FACULTY);
    const name = profile?.fullName || profile?.name;
    if (name) localStorage.setItem(STORAGE_KEYS.NAME, name);
  } catch (_) {
    // ignore faculty profile fetch errors
  }
  return ROLES.FACULTY;
}

export async function refreshUserName() {
  const role = localStorage.getItem(STORAGE_KEYS.ROLE);
  try {
    if (role === ROLES.STUDENT) {
      const p = await studentService.viewProfile();
      const name = p?.fullName || p?.name;
      if (name) localStorage.setItem(STORAGE_KEYS.NAME, name);
    } else if (role === ROLES.FACULTY) {
      const p = await facultyService.viewProfile();
      const name = p?.fullName || p?.name;
      if (name) localStorage.setItem(STORAGE_KEYS.NAME, name);
    }
  } catch (_) { /* ignore */ }
}
