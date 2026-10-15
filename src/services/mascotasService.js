import { api } from './api';
import SIN_FOTO from '../assets/images/pata.png';

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




