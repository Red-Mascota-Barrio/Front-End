import { api } from './api';

// Rutas de CompartidoController (routes/api.php → apiResource 'compartidos')
const lista = (data) => {
  const contenido = data?.datos ?? data;
  return Array.isArray(contenido) ? contenido : [];
};

// Mensaje del back (campo "mensaje") o uno por defecto; nunca se muestran URLs internas
export const mensajeDeError = (error, porDefecto) => {
  const mensaje = error?.response?.data?.mensaje;
  return typeof mensaje === 'string' && !/localhost|127\.0\.0\.1/i.test(mensaje) ? mensaje : porDefecto;
};

export const compartidosService = {
  // params: { tipo: 'recibidos' | 'enviados', mascota_id, estado }
  listar: async (params = {}) => lista((await api.get('/compartidos', { params })).data),

  // El dueño comparte su mascota con la persona que tenga ese correo (queda pendiente hasta que responda)
  compartir: async (mascotaId, correo) => {
    const { data } = await api.post('/compartidos', { mascota_id: Number(mascotaId), correo: String(correo).trim() });
    return data;
  },

  // La persona invitada acepta o rechaza: estado = 'aceptado' | 'rechazado'
  responder: async (idCompartido, estado) => {
    const { data } = await api.put(`/compartidos/${idCompartido}`, { estado });
    return data;
  },

  // El dueño deja de compartir, o la persona deja de ver la mascota
  eliminar: async (idCompartido) => {
    const { data } = await api.delete(`/compartidos/${idCompartido}`);
    return data;
  },
};
