import { apiRequest } from './api.js';

export const adminService = {
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
  deleteStudent(email) {
    return apiRequest('/admin/student-delete', { method: 'DELETE', body: { email } });
  },
  changeUserPassword(email, password) {
    return apiRequest('/admin/change-password', { method: 'PUT', body: { email, password } });
  },
  createDepartment(name) {
    return apiRequest('/admin/update_department', { method: 'POST', body: { name } });
  },
  insertCourse(name, duration, department_id) {
    return apiRequest('/admin/insert-course', { method: 'POST', body: { name, duration: Number(duration), department_id: Number(department_id) } });
  }
};
