import axios from 'axios';

// When served over HTTPS, use HTTPS for API to avoid mixed-content blocking.
function getApiUrl(): string {
  const env = process.env.NEXT_PUBLIC_API_URL || '';
  const fallback = typeof window !== 'undefined' ? `${window.location.origin}/api` : 'http://localhost:8000/api';
  let url = env || fallback;
  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && url.startsWith('http://')) {
    url = url.replace('http://', 'https://');
  }
  return url;
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
