import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const getAuthUrl  = () => API.get('/auth/google/url');
export const currentUser = () => API.get('/auth/me');

// Rules
export const listRules   = ()         => API.get('/rules');
export const createRule  = (rule)     => API.post('/rules', rule);
export const updateRule  = (id, data) => API.put(`/rules/${id}`, data);
export const deleteRule  = (id)       => API.delete(`/rules/${id}`);

// Dashboard / Logs
export const getLogs  = () => API.get('/dashboard/logs');
export const getStats = () => API.get('/dashboard/stats');

// Analytics (new features)
export const getHealthScores    = () => API.get('/analytics/health');
export const getConflicts       = () => API.get('/analytics/conflicts');
export const getRelationships   = () => API.get('/analytics/relationships');
export const getSuggestedRules  = () => API.get('/analytics/suggestions');
export const getEnhancedStats   = () => API.get('/analytics/stats');

// AI Command Center
export const getPriorityScores    = ()             => API.get('/ai/priority');
export const getDailyDigest       = ()             => API.get('/ai/digest');
export const getOptimizationTips  = ()             => API.get('/ai/optimize');
export const getBulkLabelPreview  = (intent, label) => API.get('/ai/bulk-preview', { params: { intent, label } });
export const getSenderIntelligence = (email)       => API.get(`/ai/sender/${encodeURIComponent(email)}`);
export const getLiveStats         = ()             => API.get('/ai/live');

// Rule bulk operations
export const bulkSetActive   = (ids, active) => API.post('/rules/bulk/active', { ids, active });
export const bulkDeleteRules = (ids)         => API.post('/rules/bulk/delete', { ids });
export const duplicateRule   = (id)          => API.post(`/rules/${id}/duplicate`);

// Manual trigger
export const runNow = () => API.post('/ai/run-now');
