import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://vybe-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// Products API
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }).then(res => res.data),
  getOne: (id) => api.get(`/products/${id}`).then(res => res.data),
  getByCategory: (category) => api.get(`/products/category/${category}`).then(res => res.data),
  addReview: (id, data) => api.post(`/products/${id}/review`, data).then(res => res.data),
};

// Cart API
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart', data),
  update: (itemId, data) => api.put(`/cart/${itemId}`, data),
  remove: (itemId) => api.delete(`/cart/${itemId}`),
  clear: () => api.delete('/cart'),
};

// Orders API
export const ordersAPI = {
  create: (data) => api.post('/orders', data).then(res => res.data),
  getMyOrders: () => api.get('/orders/my-orders').then(res => res.data),
  getOne: (id) => api.get(`/orders/${id}`).then(res => res.data),
};

// Payment API
export const paymentAPI = {
  createBkash: (data) => api.post('/payment/bkash/create', data),
  executeBkash: (data) => api.post('/payment/bkash/execute', data),
  createNagad: (data) => api.post('/payment/nagad/create', data),
  verify: (data) => api.post('/payment/verify', data),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard').then(res => res.data),
  
  // Products
  createProduct: (data) => api.post('/admin/products', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(res => res.data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(res => res.data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`).then(res => res.data),
  deleteProductImage: (productId, imageId) => 
    api.delete(`/admin/products/${productId}/images/${imageId}`).then(res => res.data),
  
  // Orders
  getAllOrders: (params) => api.get('/admin/orders', { params }).then(res => res.data),
  updateOrderStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data).then(res => res.data),
  updatePaymentStatus: (id, data) => api.put(`/admin/orders/${id}/payment`, data).then(res => res.data),
  
  // Users
  getAllUsers: () => api.get('/admin/users').then(res => res.data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data).then(res => res.data),
  updateUserRole: (id, data) => api.put(`/admin/users/${id}/role`, data).then(res => res.data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`).then(res => res.data),
};

export default api;
