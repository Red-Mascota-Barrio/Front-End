import { api } from './api';
import { TIPOS_EVENTO } from './adminService';

const normalizarLista = (data) => {
  if (Array.isArray(data)) return data;
  const d = data?.datos ?? data?.data ?? data?.eventos ?? [];
  return Array.isArray(d) ? d : d?.data ?? d?.eventos ?? [];
};

const nombreTipo = (e) =>
  e.tipo ??
  e.tipo_evento?.nombre_tipo ??
  e.tipoEvento?.nombre_tipo ??
  TIPOS_EVENTO.find((t) => t.id_tipo_evento === Number(e.tipo_evento_id))?.nombre_tipo ??
  'Evento';

/**
 * EventoController@index devuelve: nombre, fecha_evento, hora_evento, ubicacion, descripcion,
 * estado_evento (Activo | Inactivo), tipo_evento { nombre_tipo } y total_inscritos (withCount).
 * La vista trabaja con titulo / fecha / hora / lugar / tipo; este adaptador traduce los campos.
 * El back NO maneja cupos: cuposTotales queda en 0 (= sin límite).
 */
export const adaptarEvento = (e) => ({
  ...e,
  id: e.id ?? e.id_evento,
  titulo: e.titulo ?? e.nombre ?? 'Evento sin nombre',
  descripcion: e.descripcion ?? '',
  fecha: String(e.fecha ?? e.fecha_evento ?? '').slice(0, 10),
  hora: e.hora ?? (e.hora_evento ? String(e.hora_evento).slice(0, 5) : ''),
  lugar: e.lugar ?? e.ubicacion ?? '',
  tipo: nombreTipo(e),
  foto: e.foto ?? e.foto_evento ?? null,
  cuposTotales: Number(e.cuposTotales ?? e.cupos_totales ?? e.cupos ?? 0),
  cuposOcupados: Number(e.cuposOcupados ?? e.total_inscritos ?? 0),
  destacado: Boolean(e.destacado),
  inscrito: Boolean(e.inscrito ?? e.esta_inscrito),
  activo: String(e.estado_evento ?? e.estado ?? 'Activo').toLowerCase() !== 'inactivo',
});

export const eventosService = {
  // Solo eventos activos. Si la API falla, el error llega a la vista (sin datos de prueba).
  listar: async () => {
    const response = await api.get('/eventos');
    return normalizarLista(response.data).map(adaptarEvento).filter((e) => e.activo);
  },

  // IDs de los eventos en los que el usuario tiene inscripción activa (GET /mis-eventos)
  idsInscritos: async () => {
    const response = await api.get('/mis-eventos');
    return new Set(normalizarLista(response.data).map((e) => Number(e.id_evento ?? e.id)));
  },

  inscribir: async (id) => {
    const response = await api.post(`/eventos/${id}/inscribirse`);
    return response.data;
  },

  cancelarInscripcion: async (id) => {
    const response = await api.delete(`/eventos/${id}/inscribirse`);
    return response.data;
  },
};
