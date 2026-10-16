import { useMemo, useState } from 'react';
import Swal from 'sweetalert2';

/* ============================================================
   Helpers compartidos del panel de administración
   (las clases de color devuelven variantes de Bootstrap: success, danger, warning…)
   ============================================================ */

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// Convierte "2026-07-19", "2026-07-19 10:00:00" o ISO en Date (sin desfase de zona horaria)
export const aFecha = (valor) => {
  if (!valor) return null;
  if (valor instanceof Date) return valor;
  const s = String(valor);
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (m && !/[zZ]|[+-]\d{2}:?\d{2}$/.test(s)) {
    return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] ?? 0), +(m[5] ?? 0), +(m[6] ?? 0));
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
};

// "19 jul 2026"
export const fechaCorta = (valor) => {
  const d = aFecha(valor);
  if (!d) return '—';
  return `${String(d.getDate()).padStart(2, '0')} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
};

// "hace 10 min", "hace 2 h", "ayer", "hace 3 días", o fecha corta
export const haceCuanto = (valor) => {
  const d = aFecha(valor);
  if (!d) return '—';
  const seg = Math.round((Date.now() - d.getTime()) / 1000);
  if (seg < 0) return fechaCorta(d);
  if (seg < 60) return 'hace un momento';
  const min = Math.round(seg / 60);
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  const dias = Math.round(h / 24);
  if (dias === 1) return 'ayer';
  if (dias < 7) return `hace ${dias} días`;
  if (dias < 30) return `hace ${Math.round(dias / 7)} sem`;
  return fechaCorta(d);
};

// "Lunes 22 de junio, 2026"
export const fechaLarga = (d = new Date()) => {
  const txt = d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return txt.charAt(0).toUpperCase() + txt.slice(1);
};

export const formatoNumero = (n) =>
  n === null || n === undefined || n === '' ? '—' : Number(n).toLocaleString('es-CO');

export const iniciales = (nombre = '', apellido = '') => {
  const partes = `${nombre} ${apellido}`.trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return '?';
  return (partes[0][0] + (partes[1]?.[0] ?? '')).toUpperCase();
};

// Color de fondo (Bootstrap) estable según el id, para los avatares con iniciales
const COLORES_AVATAR = ['bg-success', 'bg-primary', 'bg-warning', 'bg-danger', 'bg-info', 'bg-secondary', 'bg-dark'];
export const claseAvatar = (id) => COLORES_AVATAR[(Number(id) || 0) % COLORES_AVATAR.length];

// Texto normalizado para búsquedas (sin tildes ni mayúsculas)
export const normalizar = (txt) =>
  String(txt ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

/* ---------------- Usuarios ---------------- */
export const rolDeUsuario = (u) => {
  const id = Number(u?.rol_id ?? u?.id_rol ?? u?.rol?.id_rol);
  const nombre = u?.rol?.nombre_rol ?? (id === 1 ? 'admin' : 'usuario');
  const esAdmin = id === 1 || normalizar(nombre) === 'admin';
  return { id: esAdmin ? 1 : 2, esAdmin, etiqueta: esAdmin ? 'Administrador' : 'Usuario' };
};

export const usuarioActivo = (u) => u?.estado === undefined || u?.estado === null || Boolean(Number(u.estado));

/* ---------------- Mascotas ---------------- */
export const especieDeMascota = (m) => m?.raza?.especie?.nombre_especie ?? m?.especie ?? '';
export const razaDeMascota = (m) => m?.raza?.nombre_raza ?? m?.raza_nombre ?? '';

export const emojiEspecie = (especie) => {
  const e = normalizar(especie);
  if (e.includes('gat')) return '🐱';
  if (e.includes('perr') || e.includes('can')) return '🐶';
  if (e.includes('conej')) return '🐰';
  if (e.includes('ave') || e.includes('pajar')) return '🐦';
  return '🐾';
};

export const claseIconoEspecie = (especie) => {
  const e = normalizar(especie);
  if (e.includes('gat')) return 'primary';
  if (e.includes('perr')) return 'success';
  return 'warning';
};

// Estado de la mascota según su última adopción
export const estadoMascota = (m) => {
  const adopciones = Array.isArray(m?.adopciones) ? m.adopciones : [];
  const ultima = adopciones.length ? adopciones[adopciones.length - 1] : null;
  const estado = normalizar(ultima?.estado_adopcion ?? m?.estado_adopcion ?? '');
  if (estado === 'disponible') return { clave: 'disponible', texto: 'En adopción', clase: 'success' };
  if (estado === 'adoptado') return { clave: 'adoptado', texto: 'Adoptado', clase: 'secondary' };
  if (estado === 'cancelada') return { clave: 'cancelada', texto: 'Cancelada', clase: 'danger' };
  if (estado === 'no disponible') return { clave: 'no-disponible', texto: 'No disponible', clase: 'warning' };
  return { clave: 'sin-publicar', texto: 'Sin publicar', clase: 'primary' };
};

/* ---------------- Eventos ---------------- */
export const emojiTipoEvento = (tipo) => {
  const t = normalizar(tipo);
  if (t.includes('vacun')) return '💉';
  if (t.includes('adop')) return '🏠';
  if (t.includes('taller')) return '📚';
  if (t.includes('recrea')) return '🌳';
  return '📅';
};

export const claseTipoEvento = (tipo) => {
  const t = normalizar(tipo);
  if (t.includes('vacun')) return 'primary';
  if (t.includes('adop')) return 'warning';
  if (t.includes('taller')) return 'secondary';
  return 'success';
};

export const estadoEvento = (e) => {
  if (normalizar(e?.estado_evento ?? e?.estado) === 'inactivo') {
    return { clave: 'cancelado', texto: 'Cancelado', clase: 'danger' };
  }
  const fecha = aFecha(e?.fecha_evento);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (fecha && fecha < hoy) return { clave: 'realizado', texto: 'Realizado', clase: 'secondary' };
  return { clave: 'proximo', texto: 'Próximo', clase: 'success' };
};

/* ---------------- Reportes ---------------- */
export const gravedadReporte = (r) => {
  const tipo = normalizar(r?.tipo_reporte?.nombre_tipo ?? r?.tipoReporte?.nombre_tipo ?? '');
  if (tipo.includes('ofensivo') || tipo.includes('acoso')) {
    return { clave: 'urgente', texto: '🔴 Urgente', clase: 'danger' };
  }
  if (tipo.includes('falsa') || tipo.includes('peligros') || tipo.includes('spam') || tipo.includes('publicidad')) {
    return { clave: 'moderado', texto: '🟠 Moderado', clase: 'warning' };
  }
  return { clave: 'bajo', texto: '⚪ Bajo', clase: 'secondary' };
};

// Laravel serializa las relaciones en snake_case (tipoReporte -> tipo_reporte)
export const rel = (obj, snake, camel) => obj?.[snake] ?? obj?.[camel] ?? null;

export const estadoReporteId = (r) => Number(r?.estado_reporte_id ?? rel(r, 'estado_reporte', 'estadoReporte')?.id_estado_reporte ?? 1);

/* ---------------- Confirmaciones (SweetAlert2) ---------------- */
const SWAL_BASE = {
  confirmButtonColor: '#16a47a',
  cancelButtonColor: '#9ca3af',
  cancelButtonText: 'Cancelar',
  reverseButtons: true,
};

export const confirmar = async ({ titulo, texto, boton = 'Sí, continuar', peligro = false }) => {
  const r = await Swal.fire({
    ...SWAL_BASE,
    icon: peligro ? 'warning' : 'question',
    title: titulo,
    text: texto,
    showCancelButton: true,
    confirmButtonText: boton,
    confirmButtonColor: peligro ? '#e11d48' : SWAL_BASE.confirmButtonColor,
  });
  return r.isConfirmed;
};

export const notificarExito = (titulo) =>
  Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: titulo, showConfirmButton: false, timer: 2200 });

export const notificarError = (titulo, texto) =>
  Swal.fire({ ...SWAL_BASE, icon: 'error', title: titulo, text: texto });

/* ---------------- Paginación en cliente ---------------- */
export const usePaginacion = (items, porPagina = 10) => {
  const [paginaElegida, setPagina] = useState(1);
  const totalPaginas = Math.max(1, Math.ceil(items.length / porPagina));
  // Si cambian los filtros y la página elegida ya no existe, usamos la última
  const pagina = Math.min(paginaElegida, totalPaginas);

  const visibles = useMemo(
    () => items.slice((pagina - 1) * porPagina, pagina * porPagina),
    [items, pagina, porPagina],
  );

  return { pagina, setPagina, totalPaginas, visibles };
};
