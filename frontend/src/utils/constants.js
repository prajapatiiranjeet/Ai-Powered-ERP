export const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  STUDENT: 'STUDENT',
  FACULTY: 'FACULTY'
});

export const STORAGE_KEYS = Object.freeze({
  TOKEN: 'erp_token',
  USER_ID: 'erp_userId',
  ROLE: 'erp_role',
  EMAIL: 'erp_email',
  NAME: 'erp_name'
});

export const ROUTES = Object.freeze({
  LOGIN: '/login',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_STUDENTS: '/admin/students',
  ADMIN_FACULTY: '/admin/faculty',
  ADMIN_DEPARTMENTS: '/admin/departments',
  STUDENT_DASHBOARD: '/student/dashboard',
  STUDENT_PROFILE: '/student/profile',
  FACULTY_DASHBOARD: '/faculty/dashboard',
  FACULTY_PROFILE: '/faculty/profile'
});

export const ROLE_DEFAULT_ROUTE = Object.freeze({
  [ROLES.ADMIN]: ROUTES.ADMIN_DASHBOARD,
  [ROLES.STUDENT]: ROUTES.STUDENT_DASHBOARD,
  [ROLES.FACULTY]: ROUTES.FACULTY_DASHBOARD
});
