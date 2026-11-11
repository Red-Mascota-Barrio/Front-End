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
  if (token && token !== 'undefined' && token !== 'null' && token.trim() !== '') {
    config.headers.Authorization = `Bearer ${token.trim()}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

// Flag de control para evitar bucles de redirección y llamadas repetidas tras 401
let isHandling401 = false;

// La sesión se invalida cuando el backend ya no acepta el token.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');

      // Evita bucle si ya estamos en la página de login o si hay múltiples 401 concurrentes
      if (!isHandling401 && !window.location.hash.includes('/login')) {
        isHandling401 = true;
        window.location.hash = '#/login';
        setTimeout(() => {
          isHandling401 = false;
        }, 1500);
      }
    }
    return Promise.reject(error);
  },
);

export { api };
