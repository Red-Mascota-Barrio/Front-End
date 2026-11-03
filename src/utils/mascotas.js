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

export const TAMANOS_MASCOTA = [
  { valor: 'pequeno', texto: 'Pequeño' },
  { valor: 'mediano', texto: 'Mediano' },
  { valor: 'grande', texto: 'Grande' },
];

// "2026-11-03" de hoy (hora local), útil para el max de los inputs de fecha
export const hoyISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Meses cumplidos desde la fecha de nacimiento ("2024-05-10"), o null
export const mesesDesde = (fecha) => {
  const m = String(fecha ?? '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const hoy = new Date();
  let meses = (hoy.getFullYear() - Number(m[1])) * 12 + (hoy.getMonth() + 1 - Number(m[2]));
  if (hoy.getDate() < Number(m[3])) meses -= 1;
  return meses >= 0 ? meses : null;
};

// Edad en años (con decimales si es menor de 1 año): usa la fecha de nacimiento si existe
export const edadEnAnios = (m) => {
  const meses = mesesDesde(m?.fecha_nacimiento);
  if (meses !== null) return meses / 12;
  const n = Number(m?.edad_estimada ?? m?.edad);
  return m?.edad_estimada === null || m?.edad_estimada === undefined || m?.edad_estimada === '' || !Number.isFinite(n)
    ? null
    : n;
};

// Etapa de vida para filtrar y buscar ("cachorro", "adulto"…)
export const ETAPAS_EDAD = [
  { valor: 'cachorro', texto: 'Cachorro (< 1 año)', min: 0, max: 1 },
  { valor: 'joven', texto: 'Joven (1–3 años)', min: 1, max: 4 },
  { valor: 'adulto', texto: 'Adulto (4–7 años)', min: 4, max: 8 },
  { valor: 'senior', texto: 'Senior (8+ años)', min: 8, max: Infinity },
];
export const etapaEdad = (m) => {
  const anios = edadEnAnios(m);
  if (anios === null) return null;
  return ETAPAS_EDAD.find((e) => anios >= e.min && anios < e.max)?.valor ?? null;
};

// "3 años" / "5 meses": con fecha de nacimiento se calcula; si no, usa edad_estimada
export const textoEdad = (m) => {
  const meses = mesesDesde(m?.fecha_nacimiento);
  if (meses !== null) {
    if (meses < 12) return meses <= 0 ? 'Menos de 1 mes' : `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
    const anios = Math.floor(meses / 12);
    return `${anios} ${anios === 1 ? 'año' : 'años'}`;
  }
  const e = m?.edad_estimada ?? m?.edad;
  if (e === null || e === undefined || e === '') return null;
  const n = Number(e);
  if (!Number.isFinite(n)) return String(e);
  return `${n} ${n === 1 ? 'año' : 'años'}`;
};

// "15 mar 2024" a partir de "2024-03-15"
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
export const textoFecha = (fecha) => {
  const m = String(fecha ?? '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${Number(m[3])} ${MESES_CORTOS[Number(m[2]) - 1]} ${m[1]}` : '';
};

// "8.50" -> "8,5 kg"
export const textoPeso = (peso) => {
  const n = Number(peso);
  if (peso === null || peso === undefined || peso === '' || !Number.isFinite(n) || n <= 0) return '';
  return `${n.toLocaleString('es-CO', { maximumFractionDigits: 2 })} kg`;
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

// Solicitudes de adopción enviadas desde este navegador (respaldo por si la API aún no
// devuelve ya_solicitada). Se guarda el id de la PUBLICACIÓN (adopción), no el de la mascota:
// si el dueño cancela y la vuelve a publicar, la persona puede postularse de nuevo.
const claveSolicitudes = (idUsuario) => `adopciones_solicitadas_v2_${idUsuario}`;
const leerSolicitudes = (idUsuario) => {
  try { return JSON.parse(localStorage.getItem(claveSolicitudes(idUsuario)) ?? '[]'); } catch { return []; }
};
export const idMascota = (m) => m?.id_mascotas ?? m?.id_mascota ?? m?.id;
export const idAdopcionActiva = (m) => m?.adopcion_activa_id ?? m?.id_adopcion ?? null;
export const marcarSolicitudLocal = (idUsuario, idAdopcion) => {
  if (!idUsuario || !idAdopcion) return;
  try {
    const lista = new Set(leerSolicitudes(idUsuario).map(Number));
    lista.add(Number(idAdopcion));
    localStorage.setItem(claveSolicitudes(idUsuario), JSON.stringify([...lista]));
  } catch { /* almacenamiento no disponible: el back igual responde 409 */ }
};

// ¿Este usuario ya envió una solicitud para la publicación vigente de la mascota?
export const yaSolicitoAdopcion = (m, idUsuario) => {
  if (idUsuario === undefined || idUsuario === null) return false;
  if (m?.ya_solicitada === true) return true; // dato del back para el usuario autenticado
  const idAdopcion = idAdopcionActiva(m);
  if (idAdopcion && leerSolicitudes(idUsuario).map(Number).includes(Number(idAdopcion))) return true;
  return (m?.solicitudes ?? []).some((sol) => {
    const quien = [sol?.usuario_postulante, sol?.usuario_id, sol?.usuario?.id_usuario].map(Number);
    return quien.includes(Number(idUsuario)) && minus(sol?.fase_actual ?? sol?.estado) !== 'rechazada';
  });
};

// Regla del botón "Adoptar": sesión iniciada, no es su mascota, hay una publicación de adopción
// 'Disponible' (adopcion_activa_id, la que exige POST /solicitudes) y no la ha solicitado ya
export const puedeAdoptar = (m, user) =>
  Boolean(user) &&
  Boolean(m?.adopcion_activa_id) &&
  !esMiMascota(m, user.id_usuario) &&
  !yaSolicitoAdopcion(m, user.id_usuario);
