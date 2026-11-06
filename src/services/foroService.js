import { api } from "./api";

export const foroService = {
  listar: async () => {
    const respuesta = await api.get("/foros");
    return respuesta.data;
  },

  obtenerPorId: async (id) => {
    const respuesta = await api.get(`/foros/${id}`);
    return respuesta.data;
  },

  crear: async (nuevoHilo) => {
    const respuesta = await api.post("/foros", nuevoHilo);
    return respuesta.data;
  },

  crearComentario: async (foroId, datosComentario, comentarioPadreId = null) => {
    // ParticipacionForoController@store valida foro_id y comentario (máx. 500)
    const payload = {
      foro_id: Number(foroId),
      comentario: datosComentario.contenido.trim(),
      comentario_padre_id: comentarioPadreId ? Number(comentarioPadreId) : null,
    };

    const respuesta = await api.post("/comentarios", payload);
    return respuesta.data;
  },

  // Borra un comentario (el back debe permitirlo solo al autor o a un administrador)
  eliminarComentario: async (comentarioId) => {
    const respuesta = await api.delete(`/comentarios/${comentarioId}`);
    return respuesta.data;
  },

  recomendarComentario: async (comentarioId) => {
    const respuesta = await api.post(`/comentarios/${comentarioId}/recomendar`);
    return respuesta.data;
  },

  quitarRecomendacion: async (comentarioId) => {
    const respuesta = await api.delete(`/comentarios/${comentarioId}/recomendar`);
    return respuesta.data;
  },

  // ReporteController@store: tipo_reporte_id + (comentario_id | foro_id)
  crearReporte: async (datosReporte) => {
    const respuesta = await api.post("/reportes", datosReporte);
    return respuesta.data;
  },
};
