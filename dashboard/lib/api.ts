import axios from 'axios';

// Server: need full URL for SSR. Browser: use relative path so request uses page origin (fixes mixed content).
function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    return '/api';
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

// Request interceptor: in browser always use relative /api so HTTPS page never requests HTTP
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Force relative base: never use absolute http(s) URL so mixed content cannot occur
    const base = config.baseURL ?? '';
    config.baseURL = typeof base === 'string' && base.startsWith('http') ? '/api' : '/api';
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
