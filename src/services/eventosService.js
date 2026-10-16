import { api } from './api';

const DEMO_EVENTOS = [
  {
    id: 1,
    titulo: 'Jornada de adopción',
    tipo: 'Jornada',
    fecha: '2026-10-15',
    hora: '10:00',
    lugar: 'Parque Central',
    descripcion: 'Evento comunitario para promover adopciones responsables.',
    cupos: 40,
    cuposOcupados: 18,
    destacado: true,
    inscrito: false,
  },
  {
    id: 2,
    titulo: 'Taller de cuidado canino',
    tipo: 'Taller',
    fecha: '2026-10-20',
    hora: '18:30',
    lugar: 'Centro de Bienestar Animal',
    descripcion: 'Aprende sobre alimentación, higiene y primeros auxilios para mascotas.',
    cupos: 25,
    cuposOcupados: 12,
    destacado: false,
    inscrito: false,
  },
  {
    id: 3,
    titulo: 'Campaña de vacunación',
    tipo: 'Campaña',
    fecha: '2026-10-27',
    hora: '09:00',
    lugar: 'Plaza de la Comunidad',
    descripcion: 'Campaña de vacunación gratuita para perros y gatos.',
    cupos: 60,
    cuposOcupados: 41,
    destacado: false,
    inscrito: false,
  },
];

const normalizarLista = (data) => {
  if (Array.isArray(data)) return data;
  return data?.eventos ?? data?.data ?? data?.datos ?? [];
};

export const eventosService = {
  listar: async () => {
    try {
      const response = await api.get('/eventos');
      return {
        eventos: normalizarLista(response.data),
        demo: false,
      };
    } catch (error) {
      console.warn('No se pudo conectar con /eventos. Usando datos demo.', error);
      return {
        eventos: DEMO_EVENTOS,
        demo: true,
      };
    }
  },

  inscribir: async (id) => {
    const response = await api.post(`/eventos/${id}/inscribirse`);
    return response.data;
  },
};
