import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('pathback_access_token') || localStorage.getItem('sethu_access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token if invalid or expired
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        console.warn('Session expired or unauthorized. Redirecting to login.');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
