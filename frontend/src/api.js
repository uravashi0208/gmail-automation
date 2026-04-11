import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
});

// Attach JWT from localStorage to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const getAuthUrl = () => API.get('/auth/google/url');
export const currentUser = () => API.get('/auth/me');

// Rules
export const listRules = () => API.get('/rules');
export const createRule = (rule) => API.post('/rules', rule);
export const updateRule = (id, data) => API.put(`/rules/${id}`, data);
export const deleteRule = (id) => API.delete(`/rules/${id}`);

// Dashboard / Logs
export const getLogs = () => API.get('/dashboard/logs');
export const getStats = () => API.get('/dashboard/stats');
