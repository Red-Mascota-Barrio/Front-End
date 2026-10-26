import { api } from './api';

// Rutas del módulo de notificaciones (routes/api.php → prefix "notificaciones")
const RUTAS = {
  base: '/notificaciones',
  noLeidas: '/notificaciones/no-leidas',
  leerTodas: '/notificaciones/leer-todas',
  preferencias: '/notificaciones/preferencias',
};

// El NotificacionController responde el arreglo/objeto directo (sin { datos })
const datos = (response) => response.data?.datos ?? response.data;

export const notificacionesService = {
  // Últimas notificaciones del usuario autenticado
  listar: async (limite = 15) => {
    const d = datos(await api.get(RUTAS.base, { params: { limite } }));
    return Array.isArray(d) ? d : [];
  },

  // Solo el número de no leídas (consulta liviana para la campana)
  contarNoLeidas: async () => Number(datos(await api.get(RUTAS.noLeidas))?.no_leidas ?? 0),

  marcarLeida: async (id) => datos(await api.patch(`${RUTAS.base}/${id}/leer`)),
  marcarTodasLeidas: async () => datos(await api.patch(RUTAS.leerTodas)),
  eliminar: async (id) => datos(await api.delete(`${RUTAS.base}/${id}`)),

  // Preferencias (RNF12): { notificar_evento, notificar_adopcion, notificar_foro, notificar_reporte }
  obtenerPreferencias: async () => datos(await api.get(RUTAS.preferencias)),
  guardarPreferencias: async (prefs) => datos(await api.put(RUTAS.preferencias, prefs)),
};

// "hace 5 min", "hace 2 h", "hace 3 días"…
export const haceCuanto = (fecha) => {
  if (!fecha) return '';
  const d = new Date(String(fecha).replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return '';
  const seg = Math.max(0, Math.round((Date.now() - d.getTime()) / 1000));
  if (seg < 60) return 'justo ahora';
  const min = Math.round(seg / 60);
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  const dias = Math.round(h / 24);
  if (dias < 7) return `hace ${dias} ${dias === 1 ? 'día' : 'días'}`;
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
};
