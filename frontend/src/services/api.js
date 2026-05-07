import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach Clerk token
api.interceptors.request.use(
  async (config) => {
    if (window.Clerk && window.Clerk.session) {
      const token = await window.Clerk.session.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect if we're already on the login or register page to avoid loops
      const path = window.location.pathname;
      if (path === '/login' || path === '/register') {
        return Promise.reject(error);
      }

      if (window.Clerk) {
        window.Clerk.signOut();
      }
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
