// lib/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://localhost:7087/api',
  timeout: 15000,
});

export default api;