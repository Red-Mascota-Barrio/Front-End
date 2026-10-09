import { api } from './api';

// La URL de storage se deriva de VITE_API_URL (http://localhost:8000/api -> http://localhost:8000)
const BASE_STORAGE = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');

export const SIN_FOTO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="100%" height="100%" fill="#e9ecef"/><text x="50%" y="50%" fill="#6c757d" font-family="Arial" font-size="16" text-anchor="middle" dy=".3em">Sin imagen</text></svg>`
  );

export const urlFoto = (foto) => {
  if (!foto) return SIN_FOTO;
  if (/^https?:\/\//i.test(foto)) return foto;
  return `${BASE_STORAGE}/storage/${foto}`;
};

const lista = (data) =>
  Array.isArray(data) ? data : data?.datos ?? data?.data ?? data?.mascotas ?? [];

export const mascotasService = {
  // GET /mascotas (Listar todas)
  listar: async () => {
    const res = await api.get('/mascotas');
    return lista(res.data);
  },

  // POST /mascotas (Registrar nueva mascota)
  crear: async (datosMascota) => {
    const res = await api.post('/mascotas', datosMascota);
    return res.data;
  },

  // GET /mascotas/:id (Obtener perfil de una mascota por ID)
  obtenerPorId: async (id) => {
    const res = await api.get(`/mascotas/${id}`);
    return res.data;
  },

  // --- NUEVOS MÉTODOS PARA ESPECIES Y RAZAS DESDE LA BD ---

  // GET /especies (Obtener lista de especies)
  obtenerEspecies: async () => {
    const res = await api.get('/especies');
    return lista(res.data);
  },

  // GET /razas/especie/:idEspecie (Obtener razas de una especie específica)
  // O GET /razas?id_especie=... si tu backend lo maneja por query param
  obtenerRazasPorEspecie: async (idEspecie) => {
    const res = await api.get(`/razas/especie/${idEspecie}`);
    return lista(res.data);
  }
};




