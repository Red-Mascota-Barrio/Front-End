// Helpers de presentación para mascotas (compartidos por tarjetas y modales)

export const capitalizar = (t) => (t ? String(t).charAt(0).toUpperCase() + String(t).slice(1) : '');

const TAMANOS = { pequeno: 'Pequeño', mediano: 'Mediano', grande: 'Grande' };

// "pequeno" (valor de la BD) -> "Pequeño"
export const textoTamano = (t) => {
  if (!t) return '';
  const k = String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return TAMANOS[k] ?? capitalizar(t);
};

// Marca la imagen por defecto para mostrarla tenue y sin recortar
export const claseFoto = (src, sinFoto) => (src === sinFoto ? 'sin-foto' : '');

// "3 años" a partir de edad_estimada (columna real de la BD)
export const textoEdad = (m) => {
  const e = m?.edad_estimada ?? m?.edad;
  if (e === null || e === undefined || e === '') return null;
  const n = Number(e);
  if (!Number.isFinite(n)) return String(e);
  return `${n} ${n === 1 ? 'año' : 'años'}`;
};

/* ---------- Propiedad y adopción ---------- */
const minus = (v) => String(v ?? '').toLowerCase();

// Ids de los dueños de una mascota, sin importar cómo los serialice Laravel
// (columna directa o relación usuarios / usuario_mascotas).
const idsDuenos = (m) => {
  const ids = [
    m?.usuario_id, m?.propietario_id, m?.dueno_id, m?.user_id,
    m?.usuario?.id_usuario, m?.propietario?.id_usuario, m?.dueno?.id_usuario,
  ];
  ['usuarios', 'duenos', 'propietarios', 'usuario_mascotas', 'usuarioMascotas'].forEach((k) => {
    if (Array.isArray(m?.[k])) m[k].forEach((u) => ids.push(u?.id_usuario, u?.usuario_id, u?.pivot?.usuario_id));
  });
  return ids.filter((v) => v !== undefined && v !== null && v !== '').map(Number);
};

export const tieneInfoDueno = (m) => idsDuenos(m).length > 0;
export const esMiMascota = (m, idUsuario) =>
  idUsuario !== undefined && idUsuario !== null && idsDuenos(m).includes(Number(idUsuario));

// Solicitudes de adopción enviadas desde este navegador (por si la API no las devuelve en GET /mascotas)
const claveSolicitudes = (idUsuario) => `adopciones_solicitadas_${idUsuario}`;
const leerSolicitudes = (idUsuario) => {
  try { return JSON.parse(localStorage.getItem(claveSolicitudes(idUsuario)) ?? '[]'); } catch { return []; }
};
export const idMascota = (m) => m?.id_mascotas ?? m?.id_mascota ?? m?.id;
export const marcarSolicitudLocal = (idUsuario, idMasc) => {
  const lista = new Set(leerSolicitudes(idUsuario).map(Number));
  lista.add(Number(idMasc));
  localStorage.setItem(claveSolicitudes(idUsuario), JSON.stringify([...lista]));
};

// ¿Este usuario ya tiene una adopción / solicitud vigente sobre la mascota?
export const yaSolicitoAdopcion = (m, idUsuario) => {
  if (idUsuario === undefined || idUsuario === null) return false;
  if (m?.ya_solicitada === true) return true; // dato del back para el usuario autenticado
  if (leerSolicitudes(idUsuario).map(Number).includes(Number(idMascota(m)))) return true;
  const registros = [...(m?.adopciones ?? []), ...(m?.solicitudes ?? [])];
  return registros.some((a) => {
    const quien = [a?.usuario_id, a?.adoptante_id, a?.solicitante_id, a?.usuario?.id_usuario].map(Number);
    const estado = minus(a?.estado_adopcion ?? a?.estado);
    return quien.includes(Number(idUsuario)) && !['cancelada', 'rechazada'].includes(estado);
  });
};

// Regla del botón "Adoptar": sesión iniciada, no es su mascota, hay una publicación de adopción
// 'Disponible' (adopcion_activa_id, la que exige POST /solicitudes) y no la ha solicitado ya
export const puedeAdoptar = (m, user) =>
  Boolean(user) &&
  Boolean(m?.adopcion_activa_id) &&
  !esMiMascota(m, user.id_usuario) &&
  !yaSolicitoAdopcion(m, user.id_usuario);
