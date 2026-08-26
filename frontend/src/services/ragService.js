import { apiRequest } from './api.js';
import { STORAGE_KEYS, ROLES } from '../utils/constants.js';

const askEndpoints = {
  ADMIN: '/admin/ask-to-sherpal',
  FACULTY: '/faculty/ask-to-sherpal',
  STUDENT: '/students/ask-to-sherpal'
};

export const ragService = {
  ask(role, question) {
    const endpoint = askEndpoints[role];
    if (!endpoint) throw new Error('Your role is not allowed to use SHERPAL.');
    return apiRequest(endpoint, {
      method: 'POST',
      body: question,
      headers: { 'Content-Type': 'text/plain' }
    });
  },

  uploadDocument(file) {
    if (localStorage.getItem(STORAGE_KEYS.ROLE) !== ROLES.ADMIN) {
      throw new Error('Only admins can upload knowledge documents.');
    }
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest('/admin/upload-documents', {
      method: 'POST',
      body: formData
    });
  }
};