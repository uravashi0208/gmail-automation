import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

const API = axios.create({
  baseURL: API_URL || 'http://localhost:4000/api'
});

export const getAuthUrl = () => API.get('/auth/google/url');
export const currentUser = (token) => API.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
export const listRules = (token) => API.get('/rules', { headers: { Authorization: `Bearer ${token}` } });
export const createRule = (token, rule) => API.post('/rules', rule, { headers: { Authorization: `Bearer ${token}` } });
export const updateRule = (token, id, data) => API.put(`/rules/${id}`, data, { headers: { Authorization: `Bearer ${token}` } });
export const deleteRule = (token, id) => API.delete(`/rules/${id}`, { headers: { Authorization: `Bearer ${token}` } });
export const getLogs = (token) => API.get('/dashboard/logs', { headers: { Authorization: `Bearer ${token}` } });
