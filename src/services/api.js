import axios from 'axios';
import { API_URL } from '../config/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Sanctum: el token Bearer viaja en cada petición cuando hay sesión.
api.interceptors.request.use((config) => {
  if (!config.baseURL || config.baseURL === 'undefined') {
    const errorMsg = '[API] Petición cancelada: baseURL de la API no está configurada.';
    console.error(errorMsg, config.url);
    return Promise.reject(new Error(errorMsg));
  }

  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    config.headers.delete('Content-Type');
  }

  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// La sesión se invalida cuando el backend ya no acepta el token.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.hash = '#/login';
    }
    return Promise.reject(error);
  },
);

export { api };
