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

  crearComentario: async (foroId, datosComentario) => {
    const payload = {
      id_foro: Number(foroId),
      foro_id: Number(foroId), // Se envían ambos por si Laravel valida 'id_foro' o 'foro_id'
      contenido: datosComentario.contenido,
      comentario: datosComentario.contenido.trim(), // Se envían ambos alias
    };

    const respuesta = await api.post("/comentarios", payload);
    return respuesta.data;
  },

  crearReporte: async (datosReporte) => {
    const respuesta = await api.post("/reportes", datosReporte);
    return respuesta.data;
  },

};