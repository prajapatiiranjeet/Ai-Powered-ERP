import { apiRequest } from './api.js';

export const facultyService = {
  // Attendance APIs use apiRequest so the stored JWT is attached automatically.
  getOfferings() {
    return apiRequest('/faculty/my-subjects', { method: 'GET' });
  },
  getAttendanceRoster(offeringId, date) {
    return apiRequest(`/faculty/attendance/roster?offeringId=${offeringId}&date=${date}`, { method: 'GET' });
  },
  markAttendance(payload) {
    return apiRequest('/faculty/attendance', { method: 'POST', body: payload });
  },
  viewProfile() {
    return apiRequest('/faculty/view-profile', { method: 'GET' });
  },
  updateProfile(dto) {
    return apiRequest('/faculty/faculty-update', { method: 'PUT', body: dto });
  },
  changePassword(email, password) {
    return apiRequest('/faculty/faculty-change-password', { method: 'PUT', body: { email, password } });
  }
};
