// A dónde lleva cada notificación al hacer clic.
// El back guarda en `datos` a qué se refiere (mascota_id, foro_id, comentario_id, evento_id…)
// y aquí se traduce a una ruta del front. Si no hay a dónde ir devuelve null (solo se marca como leída).

const ADMIN = '1'; // Roles (RoleSeeder): 1 = Administrador, 2 = Usuario

export const rutaDeNotificacion = (n, { role } = {}) => {
  const d = n?.datos ?? {};

  // Adopciones: la persona dueña abre su perfil con el modal de la mascota (ahí están las solicitudes).
  // Quien se postuló y fue aprobado también la ve en su perfil; si fue rechazado o se canceló, va al catálogo.
  if (n?.tipo === 'adopcion') {
    if (!d.mascota_id) return null;
    return d.en_perfil ? `/perfil?tab=mascotas&mascota=${d.mascota_id}` : '/mascotas';
  }

  // Mascotas compartidas: la invitación se responde en un modal (lo abre la campana); la respuesta
  // a quien compartió lo lleva a su perfil con el modal de la mascota (ahí ve con quién la compartió).
  if (n?.tipo === 'compartido') {
    if (d.accion === 'responder' || !d.mascota_id) return null;
    return d.en_perfil ? `/perfil?tab=mascotas&mascota=${d.mascota_id}` : null;
  }

  // Foro y reportes de foro/comentario: al hilo, posicionado en el comentario si lo hay
  if (n?.tipo === 'foro' || n?.tipo === 'reporte') {
    if (!d.foro_id) return null;
    return d.comentario_id ? `/foro/${d.foro_id}?comentario=${d.comentario_id}` : `/foro/${d.foro_id}`;
  }

  // Eventos: el organizador (admin) va al panel; los inscritos, al evento dentro de la lista
  if (n?.tipo === 'evento') {
    if (!d.evento_id) return '/eventos'; // evento eliminado: queda la lista general
    if (d.para === 'organizador' && String(role) === ADMIN) {
      return `/admin/eventos?evento=${encodeURIComponent(d.evento_id)}&inscritos=1`;
    }
    return `/eventos?evento=${d.evento_id}`;
  }

  return null;
};
