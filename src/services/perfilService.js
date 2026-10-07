import { api } from './api';

// Todas las rutas del módulo Perfil están centralizadas aquí.
// Si alguna ruta de tu API Laravel se llama distinto, solo cámbiala en este archivo.
const RUTAS = {
  perfil: '/perfil',                          // GET (datos + estadísticas) / PUT (editar) / DELETE (eliminar cuenta)
  foto: '/perfil/foto',                       // POST multipart (campo "foto")
  contrasena: '/perfil/contrasena',           // PUT
  misMascotas: '/perfil/mascotas',            // GET
  actividadForo: '/perfil/actividad-foro',    // GET
  misEventos: '/perfil/eventos',              // GET
  preferencias: '/notificaciones/preferencias', // GET / PUT
};

// Laravel responde { mensaje, datos }; devolvemos directamente "datos"
const datos = (response) => response.data?.datos ?? response.data;

export const perfilService = {
  // RF05 - Ver perfil: datos del usuario + estadísticas + estado de verificación
  obtener: async () => datos(await api.get(RUTAS.perfil)),

  // RF05 - Editar datos del perfil
  actualizar: async (payload) => datos(await api.put(RUTAS.perfil, payload)),

  // Subir / cambiar foto de perfil (multipart/form-data)
  subirFoto: async (archivo) => {
    const formData = new FormData();
    formData.append('foto', archivo);
    const response = await api.post(RUTAS.foto, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return datos(response);
  },

  // Cambio de contraseña
  cambiarContrasena: async (payload) => {
    // { contrasena_actual, contrasena, contrasena_confirmation }
    const response = await api.put(RUTAS.contrasena, payload);
    return response.data;
  },

  // Eliminar cuenta (se pide la contraseña como confirmación)
  eliminarCuenta: async (contrasena) => {
    const response = await api.delete(RUTAS.perfil, { data: { contrasena } });
    return response.data;
  },

  // Pestañas del perfil
  misMascotas: async () => datos(await api.get(RUTAS.misMascotas)),
  actividadForo: async () => datos(await api.get(RUTAS.actividadForo)),
  misEventos: async () => datos(await api.get(RUTAS.misEventos)),

  // Pestaña Notificaciones (RNF12 - preferencias)
  obtenerPreferencias: async () => datos(await api.get(RUTAS.preferencias)),
  guardarPreferencias: async (preferencias) => {
    const response = await api.put(RUTAS.preferencias, { preferencias });
    return response.data;
  },
};
