import { api } from './api';

export const statsService = {
  // 1. Endpoint público: GET /api/estadisticas
  // Cifras generales (mascotas, adopciones, usuarios) para el inicio
  obtenerGenerales: async () => {
    const response = await api.get('/estadisticas');
    return response.data.datos;
  },

  // 2. Endpoint protegido: GET /api/estadisticas/usuario
  // Cifras personales (mascotas, publicaciones, eventos, adopciones) para el perfil
  obtenerUsuario: async (token) => {
    const response = await api.get('/estadisticas/usuario', {
      // Enviamos el token para que Laravel sepa de qué usuario buscar las estadísticas
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.datos;
  }
};