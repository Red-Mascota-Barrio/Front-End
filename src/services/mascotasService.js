import api from './api';
import SIN_FOTO from '../assets/pata.png';

export { SIN_FOTO };

const lista = (data) =>
  Array.isArray(data) ? data : data?.datos ?? data?.data ?? data?.mascotas ?? [];

// Convierte la ruta de foto que devuelve Laravel en una URL completa
export const urlFoto = (foto) => {
  if (!foto) return SIN_FOTO;
  if (/^https?:\/\//i.test(foto)) return foto;
  const base = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '');
  return `${base}/storage/${String(foto).replace(/^\/+/, '')}`;
};

export const mascotasService = {
  listar: async () => {
    const response = await api.get('/mascotas');
    return lista(response.data);
  },
  obtener: async (id) => {
    const response = await api.get(`/mascotas/${id}`);
    return response.data;
  },
  crear: async (mascotaData) => {
    const response = await api.post('/mascotas', mascotaData);
    return response.data;
  },
};
