import { api } from './api';

export const statsService = {
  // Endpoint público de Laravel: GET /estadisticas
  // Debe responder { datos: { mascotas, adopciones, usuarios } }
  obtener: async () => {
    const response = await api.get('/estadisticas');
    return response.data.datos;
  },
};
