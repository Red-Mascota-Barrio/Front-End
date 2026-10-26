import { api } from './api';

/*
 * Rutas del módulo Perfil según routes/api.php del Back-End.
 * Antes el front llamaba a /perfil, /perfil/foto, /perfil/contrasena, /perfil/mascotas…
 * que NO existen en Laravel (todas respondían 404).
 */
const RUTAS = {
  yo: '/user',                                   // GET  datos del usuario autenticado (con rol)
  estadisticas: '/estadisticas/usuario',         // GET  mascotas, publicaciones, eventos, adopciones
  usuario: (id) => `/usuarios/${id}`,            // PUT  editar perfil propio
  foto: '/perfil/foto',                          // POST foto_perfil del usuario autenticado
  misEventos: '/mis-eventos',                    // GET  eventos con inscripción activa
  foros: '/foros',                               // GET  se filtra por usuario_id para la actividad
  preferencias: '/notificaciones/preferencias',  // GET / PUT
};

// Funciones que el back todavía no expone. La UI las muestra deshabilitadas.
export const PERFIL_SOPORTA = {
  foto: true,
  contrasena: false,  // falta PUT para cambiar contraseña con la actual (existe /recuperar)
  eliminarCuenta: false, // DELETE /usuarios/{id} es solo para admin
  misMascotas: false, // falta GET de las mascotas del usuario (usuario_mascotas)
};

// Laravel responde { resultado, mensaje, datos }; devolvemos directamente "datos"
const datos = (response) => response.data?.datos ?? response.data;
const lista = (response) => {
  const d = datos(response);
  return Array.isArray(d) ? d : [];
};

const sinRuta = (accion) =>
  Promise.reject(
    Object.assign(new Error(`El servidor todavía no tiene una ruta para ${accion}.`), {
      response: { data: { mensaje: `El servidor todavía no tiene una ruta para ${accion}.` } },
    }),
  );

export const perfilService = {
  obtener: async () => datos(await api.get(RUTAS.yo)),
  estadisticas: async () => datos(await api.get(RUTAS.estadisticas)),

  // Campos que acepta UsuarioController@update: nombre, apellido, telefono, barrio, ciudad, direccion, descripcion
  actualizar: async (idUsuario, payload) => datos(await api.put(RUTAS.usuario(idUsuario), payload)),

  misEventos: async () => lista(await api.get(RUTAS.misEventos)),

  // Hilos creados por el usuario (el back no tiene un endpoint de actividad propio)
  actividadForo: async (idUsuario) => {
    const hilos = lista(await api.get(RUTAS.foros));
    return hilos.filter((h) => Number(h.usuario_id) === Number(idUsuario));
  },

  // PreferenciaNotificacionController devuelve el modelo directamente (sin "datos")
  obtenerPreferencias: async () => (await api.get(RUTAS.preferencias)).data,
  guardarPreferencias: async (prefs) => (await api.put(RUTAS.preferencias, prefs)).data,

  subirFoto: async (archivo) => {
    const formData = new FormData();
    formData.append('foto_perfil', archivo);
    return datos(await api.post(RUTAS.foto, formData));
  },
  cambiarContrasena: () => sinRuta('cambiar la contraseña'),
  eliminarCuenta: () => sinRuta('eliminar la cuenta'),
};
