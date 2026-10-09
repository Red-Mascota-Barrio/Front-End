import axios from 'axios';

// Creamos la instancia de Axios con la URL base del .env
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Interceptor opcional: Inyecta automáticamente el token en cada petición si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const getMascotas = async () => {
  try {
    const response = await api.get('/mascotas');
    return response.data;
  } catch (error) {
    console.error('Error al obtener mascotas;', error);
    throw error;
  }
};

export const registrarMascota = async (nuevaMascota) => {
  try {
    const response = await api.post('/mascotas', nuevaMascota);
    return response.data;
  } catch (error) {
    console.error('Error al registrar mascota:', error);
    throw error;
  }
};

export const getMascotaById = async (id) => {
  try {
    const response = await api.get(`/mascotas/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener mascota con ${id}:`, error);
    throw error;
  }
};

