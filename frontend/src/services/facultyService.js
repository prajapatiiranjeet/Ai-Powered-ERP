import { apiRequest } from './api.js';

export const facultyService = {
  updateProfile(dto) {
    return apiRequest('/faculty/faculty-update', { method: 'PUT', body: dto });
  },
  changePassword(email, password) {
    return apiRequest('/faculty/faculty-change-password', { method: 'PUT', body: { email, password } });
  }
};
