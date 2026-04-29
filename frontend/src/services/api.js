import axios from 'axios';

const api = axios.create({
  // Prefer same-origin `/api` (works with Vite proxy + production reverse-proxy setups).
  // Override with `VITE_API_BASE_URL` if needed (e.g. `https://localhost:7087/api`).
  baseURL:
    import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
