import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const client = axios.create({
  baseURL: API_BASE_URL,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  login: (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    return client.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  },
  register: (data) => client.post('/auth/register', data),
  googleLogin: (credential) => client.post('/auth/google', { credential }),
  getMe: () => client.get('/auth/me'),
  getMyStats: () => client.get('/auth/me/stats'),
  
  submitComplaint: (formData) => client.post('/complaints/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  analyzeImage: (formData) => client.post('/complaints/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getComplaints: () => client.get('/complaints/'),
  getComplaint: (id) => client.get(`/complaints/${id}`),
  updateStatus: (id, status) => client.patch(`/complaints/${id}/status`, { status }),
  updateNotes: (id, notes) => client.patch(`/complaints/${id}/notes`, { officer_notes: notes }),
  getAnalytics: () => client.get('/complaints/analytics'),
  deleteComplaint: (id) => client.delete(`/complaints/${id}`),
  splitCluster: (id) => client.post(`/complaints/${id}/split`),
};
