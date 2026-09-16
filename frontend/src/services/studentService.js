import { apiRequest } from './api.js';

export const studentService = {
  // Loads the authenticated student's subject-wise attendance summary.
  getAttendance() {
    return apiRequest('/students/attendance', { method: 'GET' });
  },
  viewProfile() {
    return apiRequest('/students/view-profile', { method: 'GET' });
  },
  updateProfile(dto) {
    return apiRequest('/students/update', { method: 'PUT', body: dto });
  },
  changePassword(currentPassword, newPassword) {
    return apiRequest('/students/student-change-password', { method: 'PUT', body: { currentPassword, newPassword } });
  }
};
