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
