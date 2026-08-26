import { apiRequest } from './api.js';

export const studentService = {
  viewProfile() {
    return apiRequest('/students/view-profile', { method: 'GET' });
  },
  updateProfile(dto) {
    return apiRequest('/students/update', { method: 'PUT', body: dto });
  },
  changePassword(email, password) {
    return apiRequest('/students/student-change-password', { method: 'PUT', body: { email, password } });
  }
};
