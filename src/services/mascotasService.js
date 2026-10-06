import { api } from './api';

// La URL de storage se deriva de VITE_API_URL (http://host:8000/api -> http://host:8000)
const BASE_STORAGE = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');

export const SIN_FOTO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="100%" height="100%" fill="#e9ecef"/><text x="50%" y="50%" fill="#6c757d" font-family="Arial" font-size="18" text-anchor="middle" dominant-baseline="middle">Sin foto</text></svg>`
  );

export const urlFoto = (foto) => {
  if (!foto) return SIN_FOTO;
  if (/^https?:\/\//i.test(foto)) return foto;
  return `${BASE_STORAGE}/storage/${foto}`;
};

const lista = (data) =>
  Array.isArray(data) ? data : data?.datos ?? data?.data ?? data?.mascotas ?? [];

export const mascotasService = {
  // GET /mascotas  (acepta array simple o respuestas envueltas {datos|data|mascotas})
  listar: async () => {
    const res = await api.get('/mascotas');
    return lista(res.data);
  },
};
