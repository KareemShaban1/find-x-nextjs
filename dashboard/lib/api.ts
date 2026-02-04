import axios from 'axios';

// In browser always use same origin as the page (avoids mixed content when page is HTTPS).
// On server use env or localhost for SSR.
function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api`;
  }
  const env = process.env.NEXT_PUBLIC_API_URL || '';
  return env || 'http://localhost:8000/api';
}
const API_URL = getApiUrl();

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add token to requests; ensure baseURL uses HTTPS when page is HTTPS (fix mixed content)
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Force API baseURL to match page protocol so HTTPS pages never request HTTP
    config.baseURL = getApiUrl();
  }
  return config;
});

// Handle 401 errors (redirect to dashboard login, respecting basePath)
const basePath = typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_BASE_PATH || '') : '';
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = `${basePath}/login`;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
