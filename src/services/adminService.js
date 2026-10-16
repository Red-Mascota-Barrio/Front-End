import { api } from './api';

// Todas las rutas del panel de administración están centralizadas aquí.
// Si alguna ruta de la API Laravel se llama distinto, solo cámbiala en este archivo.
const RUTAS = {
  estadisticas: '/estadisticas',
  usuarios: '/usuarios',
  mascotas: '/mascotas',
  eventos: '/eventos',
  reportes: '/reportes',
  foros: '/foros',
  comentarios: '/comentarios',
};

// Laravel responde { resultado, mensaje, datos }; devolvemos directamente "datos"
const datos = (response) => response.data?.datos ?? response.data;
const lista = (response) => {
  const d = datos(response);
  if (Array.isArray(d)) return d;
  return d?.data ?? d?.usuarios ?? d?.mascotas ?? d?.eventos ?? d?.reportes ?? [];
};

// Estados de reporte (EstadoReporteSeeder)
export const ESTADOS_REPORTE = {
  PENDIENTE: 1,
  EN_REVISION: 2,
  RESUELTO: 3,
};

// Tipos de evento (TipoEventoSeeder) — se usan si la API no los devuelve
export const TIPOS_EVENTO = [
  { id_tipo_evento: 1, nombre_tipo: 'Vacunación' },
  { id_tipo_evento: 2, nombre_tipo: 'Adopción' },
  { id_tipo_evento: 3, nombre_tipo: 'Talleres' },
  { id_tipo_evento: 4, nombre_tipo: 'Recreación' },
];

// Roles (RoleSeeder)
export const ROLES = [
  { id: 1, nombre: 'Administrador' },
  { id: 2, nombre: 'Usuario' },
];

// Extrae un mensaje legible de un error de axios
export const mensajeError = (error, porDefecto = 'Ocurrió un error inesperado.') => {
  const r = error?.response;
  if (!r) return 'No se pudo conectar con el servidor.';
  if (r.status === 404) return 'La ruta no existe en la API (404).';
  if (r.status === 405) return 'La API no permite esta acción (405).';
  if (r.status === 403) return r.data?.mensaje ?? r.data?.message ?? 'No tienes permisos para esta acción.';
  return r.data?.mensaje ?? r.data?.message ?? porDefecto;
};

export const adminService = {
  // ---------- Estadísticas ----------
  estadisticas: async () => datos(await api.get(RUTAS.estadisticas)),

  // ---------- Usuarios ----------
  listarUsuarios: async () => lista(await api.get(RUTAS.usuarios)),
  actualizarUsuario: async (id, payload) => datos(await api.put(`${RUTAS.usuarios}/${id}`, payload)),
  eliminarUsuario: async (id) => (await api.delete(`${RUTAS.usuarios}/${id}`)).data,

  // ---------- Mascotas ----------
  listarMascotas: async () => lista(await api.get(RUTAS.mascotas)),
  eliminarMascota: async (id) => (await api.delete(`${RUTAS.mascotas}/${id}`)).data,

  // ---------- Eventos ----------
  listarEventos: async () => lista(await api.get(RUTAS.eventos)),
  crearEvento: async (payload) => datos(await api.post(RUTAS.eventos, payload)),
  actualizarEvento: async (id, payload) => datos(await api.put(`${RUTAS.eventos}/${id}`, payload)),
  eliminarEvento: async (id) => (await api.delete(`${RUTAS.eventos}/${id}`)).data,

  // ---------- Reportes ----------
  listarReportes: async () => lista(await api.get(RUTAS.reportes)),
  cambiarEstadoReporte: async (id, estadoId) =>
    datos(await api.put(`${RUTAS.reportes}/${id}`, { estado_reporte_id: estadoId })),
  eliminarReporte: async (id) => (await api.delete(`${RUTAS.reportes}/${id}`)).data,

  // Elimina el contenido reportado: el comentario si lo hay, si no el hilo del foro
  eliminarContenidoReportado: async (reporte) => {
    if (reporte.comentario_id) {
      return (await api.delete(`${RUTAS.comentarios}/${reporte.comentario_id}`)).data;
    }
    if (reporte.foro_id) {
      return (await api.delete(`${RUTAS.foros}/${reporte.foro_id}`)).data;
    }
    throw new Error('El reporte no tiene contenido asociado.');
  },
};
