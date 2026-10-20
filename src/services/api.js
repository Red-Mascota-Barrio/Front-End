import axios from 'axios';

const api = axios.create({
  // Llama a la variable de entorno, con un fallback por seguridad
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // withCredentials: true // Descomenta esta línea si usas Laravel Sanctum con cookies
});

// Interceptor para inyectar el token en cada petición buscando múltiples llaves comunes
api.interceptors.request.use((config) => {
  const token = 
    localStorage.getItem('token') || 
    localStorage.getItem('access_token') || 
    localStorage.getItem('auth_token') ||
    localStorage.getItem('jwt');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export { api };
