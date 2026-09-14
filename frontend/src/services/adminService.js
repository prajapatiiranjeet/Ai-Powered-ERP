import { apiRequest } from './api.js';

export const adminService = {
  getAssignmentFaculty(filters = {}) {
    const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
    return apiRequest(`/admin/subject-assignment/faculty?${query}`, { method: 'GET' });
  },
  getAssignmentSubjects(filters = {}) {
    const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
    return apiRequest(`/admin/subject-assignment/subjects?${query}`, { method: 'GET' });
  },
  getAssignmentSections(batchId) {
    return apiRequest(`/admin/subject-assignment/sections${batchId ? `?batchId=${batchId}` : ''}`, { method: 'GET' });
  },
  getAssignmentBatches(filters = {}) {
    const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
    return apiRequest(`/admin/subject-assignment/batches?${query}`, { method: 'GET' });
  },
  assignSubject(payload) {
    return apiRequest('/admin/assign-subject-to-faculty', { method: 'POST', body: payload });
  },
  registerAdmin(payload) {
    return apiRequest('/admin/register-admin', { method: 'POST', body: payload });
  },
  registerFaculty(payload) {
    return apiRequest('/admin/register-faculty', { method: 'POST', body: payload });
  },
  registerStudent(payload) {
    return apiRequest('/admin/register-student', { method: 'POST', body: payload });
  },
  getAllStudents() {
    return apiRequest('/admin/get-all-students', { method: 'GET' });
  },
  getStudentRecords() {
    return apiRequest('/admin/get-student-records', { method: 'GET' });
  },
  getUserOptions(filters = {}) {
    const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
    return apiRequest(`/admin/user-options?${query}`, { method: 'GET' });
  },
  getFacultyCount() {
    return apiRequest('/admin/get-faculty-count', { method: 'GET' });
  },
  getDepartments() {
    return apiRequest('/admin/get-departments', { method: 'GET' });
  },
  getCourses(departmentId) {
    return apiRequest(`/admin/get-courses?departmentId=${departmentId}`, { method: 'GET' });
  },
  getBranches(courseId) {
    return apiRequest(`/admin/get-branches?courseId=${courseId}`, { method: 'GET' });
  },
  getCourseCount() {
    return apiRequest('/admin/get-course-count', { method: 'GET' });
  },
  updateStudent(studentDto) {
    return apiRequest('/admin/student-update', { method: 'PUT', body: studentDto });
  },
  updateFaculty(payload) {
    return apiRequest('/admin/faculty-update', { method: 'PUT', body: payload });
  },
  deleteStudent(email) {
    return apiRequest('/admin/student-delete', { method: 'DELETE', body: { email } });
  },
  changeUserPassword(email, password) {
    return apiRequest('/admin/change-password', { method: 'PUT', body: { email, password } });
  },
  createDepartment(name) {
    return apiRequest('/admin/update_department', { method: 'POST', body: { name } });
  },
  updateDepartment(payload) {
    return apiRequest('/admin/update_department', { method: 'POST', body: payload });
  },
  insertCourse(name, duration, department_id) {
    return apiRequest('/admin/insert-course', { method: 'POST', body: { name, duration: Number(duration), department_id: Number(department_id) } });
  }
};
