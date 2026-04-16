import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  register: (data) => api.post('/auth/register', data),
  getAllUsers: () => api.get('/auth/users'),
  updateUser: (id, data) => api.put(`/auth/users/${id}`, data),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
  updatePassword: (data) => api.put('/auth/updatepassword', data)
};

// Shop API
export const shopAPI = {
  getAll: () => api.get('/shops'),
  getOne: (id) => api.get(`/shops/${id}`),
  create: (data) => api.post('/shops', data),
  update: (id, data) => api.put(`/shops/${id}`, data),
  delete: (id) => api.delete(`/shops/${id}`)
};

// Item API
export const itemAPI = {
  getAll: () => api.get('/items'),
  getOne: (id) => api.get(`/items/${id}`),
  create: (data) => api.post('/items', data),
  update: (id, data) => api.put(`/items/${id}`, data),
  updatePrice: (id, price) => api.patch(`/items/${id}/price`, { price }),
  delete: (id) => api.delete(`/items/${id}`)
};

// Production API
export const productionAPI = {
  getToday: () => api.get('/production/today'),
  getByDate: (date) => api.get(`/production/date/${date}`),
  add: (data) => api.post('/production', data),
  bulkAdd: (productions) => api.post('/production/bulk', { productions }),
  getStock: (itemId) => api.get(`/production/stock/${itemId}`),
  getLowStock: () => api.get('/production/low-stock')
};

// Transaction API
export const transactionAPI = {
  getShopTransactions: (shopId, date) => 
    api.get(`/transactions/shop/${shopId}`, { params: { date } }),
  takeItems: (data) => api.post('/transactions/take', data),
  updateTransaction: (data) => api.put('/transactions/update', data),
  bulkUpdate: (shopId, transactions) => 
    api.post('/transactions/bulk-update', { shopId, transactions }),
  getAllShopsSummary: (startDate, endDate) => 
    api.get('/transactions/summary', { params: { startDate, endDate } }),
  getShopSummary: (shopId, date) => 
    api.get(`/transactions/shop/${shopId}/summary`, { params: { date } }),
  getShopItemTransactions: (shopId, startDate, endDate) =>
    api.get(`/transactions/shop/${shopId}/items`, { params: { startDate, endDate } })
};

// Report API
export const reportAPI = {
  getDashboard: () => api.get('/reports/dashboard'),
  getDailyReport: (date) => api.get(`/reports/daily/${date}`),
  getSalesChart: (period) => api.get('/reports/charts/sales', { params: { period } }),
  getItemPerformance: (startDate, endDate) => 
    api.get('/reports/charts/items', { params: { startDate, endDate } }),
  getShopComparison: (startDate, endDate) => 
    api.get('/reports/charts/shops', { params: { startDate, endDate } }),
  getProfitSummary: (startDate, endDate) => 
    api.get('/reports/profit', { params: { startDate, endDate } }),
  exportReport: (startDate, endDate, type) => 
    api.get('/reports/export', { 
      params: { startDate, endDate, type },
      responseType: 'blob'
    }),
  closeDay: (date, notes) => api.post('/reports/close-day', { date, notes }),
  getAuditLogs: (page, limit, action) => 
    api.get('/reports/audit-logs', { params: { page, limit, action } }),
  backup: () => api.get('/reports/backup', { responseType: 'blob' })
};

export default api;
