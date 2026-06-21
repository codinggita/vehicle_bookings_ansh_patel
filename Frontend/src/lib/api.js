import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Middleware request interceptor to strip leading slashes and attach jwt tokens
api.interceptors.request.use((config) => {
  if (config.url && config.url.startsWith('/')) {
    config.url = config.url.substring(1);
  }
  const token = localStorage.getItem('rideops_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor to format success objects and catch authentication errors globally
api.interceptors.response.use(
  ({ data }) => data,
  (error) => {
    if (error.response?.status === 401 && !String(error.config?.url).includes('/auth/login')) {
      localStorage.removeItem('rideops_token');
      localStorage.removeItem('rideops_user');
      window.dispatchEvent(new Event('rideops:unauthorized'));
    }
    const message = error.response?.data?.message || (error.request ? 'The operations API is unavailable.' : error.message);
    return Promise.reject(new Error(message));
  },
);

export default api;

export const money = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value || 0));
export const compact = (value) => new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(value || 0));
export const dateTime = (value) => value ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Not available';
export const pct = (part, total) => total ? Math.round((part / total) * 100) : 0;
