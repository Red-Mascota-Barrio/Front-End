import { api } from './api';

// Datos de demostración: se usan SOLO si el backend no responde,
// para que el módulo siga siendo navegable mientras se desarrolla.
const EVENTOS_DEMO = [
  { id: 1, titulo: 'Jornada de Adopción Barrial', descripcion: 'Conoce mascotas que buscan hogar.', tipo: 'Jornada', fecha: '2026-11-15', hora: '09:00', lugar: 'Parque Central', cuposTotales: 50, cuposOcupados: 32, destacado: true, inscrito: false },
  { id: 2, titulo: 'Taller de Cuidados Básicos', descripcion: 'Alimentación, higiene y primeros auxilios.', tipo: 'Taller', fecha: '2026-11-20', hora: '15:00', lugar: 'Salón Comunal', cuposTotales: 30, cuposOcupados: 30, destacado: false, inscrito: false },
  { id: 3, titulo: 'Campaña de Vacunación', descripcion: 'Vacunación antirrábica gratuita.', tipo: 'Campaña', fecha: '2026-12-02', hora: '08:00', lugar: 'Plaza de Mercado', cuposTotales: 100, cuposOcupados: 41, destacado: false, inscrito: false },
];

const lista = (data) =>
  Array.isArray(data) ? data : data?.datos ?? data?.data ?? data?.eventos ?? [];

// Acepta tanto el formato del front como nombres típicos de Laravel (snake_case).
const normalizar = (e) => ({
  id: e.id ?? e.id_evento,
  titulo: e.titulo ?? e.nombre ?? 'Evento sin título',
  descripcion: e.descripcion ?? '',
  tipo: e.tipo ?? e.tipo_evento ?? 'Jornada',
  fecha: e.fecha ?? e.fecha_evento ?? '',
  hora: e.hora ?? e.hora_evento ?? '',
  lugar: e.lugar ?? e.ubicacion ?? '',
  cuposTotales: Number(e.cuposTotales ?? e.cupos_totales ?? e.cupo_maximo ?? 0),
  cuposOcupados: Number(e.cuposOcupados ?? e.cupos_ocupados ?? e.inscritos ?? 0),
  destacado: Boolean(e.destacado),
  inscrito: Boolean(e.inscrito),
});

export const eventosService = {
  // GET /eventos
  listar: async () => {
    try {
      const res = await api.get('/eventos');
      return { eventos: lista(res.data).map(normalizar), demo: false };
    } catch (error) {
      console.warn('No se pudo cargar /eventos, usando datos de demostración:', error.message);
      return { eventos: EVENTOS_DEMO, demo: true };
    }
  },

  // POST /eventos/{id}/inscribir  (requiere token)
  inscribir: async (id) => {
    const res = await api.post(`/eventos/${id}/inscribir`);
    return res.data;
  },
};
