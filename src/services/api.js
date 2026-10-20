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

// Interceptor para inyectar el token en cada petición (si usas tokens Bearer)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); // Ajusta según la key que uses
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export { api };

// Creamos la instancia de Axios con la URL base del .env
