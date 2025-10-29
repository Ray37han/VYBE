import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://vybe-backend-93eu.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 120000, // 2 minutes for large file uploads
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
  
  // For FormData (file uploads), let browser set Content-Type with boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network error handling
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error('⏱️ Request timeout - upload taking too long');
      error.userMessage = 'Upload timeout. Please check your internet connection or try smaller images.';
    } else if (error.message === 'Network Error' || !error.response) {
      console.error('🌐 Network error - cannot reach server');
      error.userMessage = 'Cannot connect to server. Please check your internet connection.';
    } else if (error.response?.status === 401) {
      // Token expired or invalid - clear and redirect to login
      console.error('🔒 Authentication failed');
      localStorage.removeItem('token');
      error.userMessage = 'Session expired. Please log in again.';
      setTimeout(() => window.location.href = '/login', 2000);
    } else if (error.response?.status === 403) {
      console.error('🚫 Access denied');
      error.userMessage = 'Access denied. Admin privileges required.';
    } else if (error.response?.status >= 500) {
      console.error('💥 Server error');
      error.userMessage = 'Server error. Please try again later.';
    }
    
    return Promise.reject(error);
  }
);

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

// Featured Posters API (Public)
export const featuredPostersAPI = {
  getAll: () => api.get('/featured-posters').then(res => res.data),
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
  createProduct: (data) => {
    const token = localStorage.getItem('token');
    return api.post('/admin/products', data, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      timeout: 180000, // 3 minutes for product creation with images
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload progress: ${percentCompleted}%`);
      }
    }).then(res => res.data);
  },
  updateProduct: (id, data) => {
    const token = localStorage.getItem('token');
    return api.put(`/admin/products/${id}`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      timeout: 180000, // 3 minutes for product update with images
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload progress: ${percentCompleted}%`);
      }
    }).then(res => res.data);
  },
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

  // Featured Posters (admin methods using /api/featured-posters route)
  get: (endpoint) => api.get(endpoint),
  post: (endpoint, data) => api.post(endpoint, data),
  put: (endpoint, data) => api.put(endpoint, data),
  delete: (endpoint) => api.delete(endpoint),
};

export default api;
