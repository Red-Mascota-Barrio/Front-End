import axios from 'axios';

const api = axios.create({
  // Llama a la variable de entorno, con un fallback por seguridad
  baseURL: import.meta.env.VITE_API_URL || 'https://back-end-kks2.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // withCredentials: true // Descomenta esta línea si usas Laravel Sanctum con cookies
});

// Interceptor para inyectar el token en cada petición buscando múltiples llaves comunes
api.interceptors.request.use((config) => {
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    config.headers.delete('Content-Type');
  }

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

// 2. NUEVO: Interceptor de Respuesta (Maneja la expiración del token)

api.interceptors.response.use(
    (response) => {
       
        return response;
    }, 
    (error) => {
        
        if (error.response && error.response.status === 401) {
            // Limpiamos los datos de sesión
            localStorage.removeItem('token');
           
            window.location.href = `${import.meta.env.BASE_URL}login`;
        }
        
        return Promise.reject(error);
    }
);

export { api };
