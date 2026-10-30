import { foroService } from '../services/foroService';
import { notificarExito, notificarError } from './admin';

// Helpers del foro. La migración de Laravel usa foros.categoria_foro_id;
// el SQL viejo del mockup usaba categoria_id, por eso se aceptan ambos.

export const idHilo = (h) => h?.id_foro ?? h?.id;

export const idCategoriaHilo = (h) =>
  Number(
    h?.categoria_foro_id ??
      h?.categoria_id ??
      h?.id_categoria ??
      h?.categoria_foro?.id_categoria ??
      h?.categoriaForo?.id_categoria ??
      0,
  );

// Laravel serializa la relación categoriaForo como "categoria_foro"
export const categoriaDeHilo = (h, categorias = []) =>
  h?.categoria_foro ??
  h?.categoriaForo ??
  h?.categoria ??
  categorias.find((c) => Number(c.id_categoria) === idCategoriaHilo(h)) ??
  null;

export const nombreCategoria = (cat) =>
  typeof cat === 'string' ? cat : cat?.nombre_categoria ?? null;

// Especie de la categoría (columna Tipo: enum Perro | Gato) para elegir el ícono
export const especieDeCategoria = (cat) => String(cat?.Tipo ?? cat?.tipo ?? '');

// Categorías de categorias_foro (CategoriasSeeder). El back no tiene GET /categorias,
// así que se combinan estas con las que vienen dentro de cada hilo (relación categoria_foro).
const CATEGORIAS_BASE = [
  { id_categoria: 1, nombre_categoria: 'Perros', descripcion: 'Espacio para hablar sobre perros', Tipo: 'Perro' },
  { id_categoria: 2, nombre_categoria: 'Gatos', descripcion: 'Espacio para hablar sobre gatos', Tipo: 'Gato' },
];

export const categoriasDesdeHilos = (hilos = []) => {
  const mapa = new Map(CATEGORIAS_BASE.map((c) => [Number(c.id_categoria), c]));
  hilos.forEach((h) => {
    const cat = h?.categoria_foro ?? h?.categoriaForo;
    if (cat?.id_categoria) mapa.set(Number(cat.id_categoria), cat);
  });
  return [...mapa.values()].sort((a, b) => a.id_categoria - b.id_categoria);
};

export const nombreAutor = (obj) => {
  const u = obj?.usuario;
  if (u) return `${u.nombre ?? ''} ${u.apellido ?? ''}`.trim() || 'Usuario';
  return obj?.autor || 'Anónimo';
};

export const inicialesAutor = (obj) => {
  const partes = nombreAutor(obj).split(/\s+/).filter(Boolean);
  return ((partes[0]?.[0] ?? '?') + (partes[1]?.[0] ?? '')).toUpperCase();
};

const COLORES = ['', 'avatar-violeta', 'avatar-naranja', 'avatar-teal', 'avatar-rosa', 'avatar-azul', 'avatar-ambar'];
export const colorAvatar = (obj) => {
  const id = Number(obj?.usuario_id ?? obj?.usuario?.id_usuario ?? obj?.usuario?.id ?? 0);
  return COLORES[id % COLORES.length];
};

// Reportes ya enviados por este usuario (se guardan en el navegador para no ofrecer el botón otra vez;
// la validación real debe hacerla también el back).
const claveReportes = (idUsuario) => `reportes_enviados_${idUsuario}`;
const leerReportes = (idUsuario) => {
  try { return JSON.parse(localStorage.getItem(claveReportes(idUsuario)) ?? '[]'); } catch { return []; }
};
const llaveReporte = ({ comentarioId, foroId }) => (comentarioId ? `c${comentarioId}` : `f${foroId}`);

export const yaReporto = (idUsuario, objetivo) =>
  idUsuario !== undefined && idUsuario !== null && leerReportes(idUsuario).includes(llaveReporte(objetivo));

const guardarReporte = (idUsuario, objetivo) => {
  if (idUsuario === undefined || idUsuario === null) return;
  const lista = new Set(leerReportes(idUsuario));
  lista.add(llaveReporte(objetivo));
  localStorage.setItem(claveReportes(idUsuario), JSON.stringify([...lista]));
};

// Envía un reporte (de un comentario o de un hilo) y muestra el resultado.
// Devuelve true si el contenido quedó reportado (también cuando el back dice que ya lo estaba).
export const enviarReporte = async ({ tipoReporteId, comentarioId, foroId, idUsuario }) => {
  const objetivo = { comentarioId, foroId };
  if (yaReporto(idUsuario, objetivo)) {
    notificarError('Ya lo reportaste', 'Este contenido ya fue reportado por ti. Un moderador lo revisará.');
    return true;
  }
  try {
    const respuesta = await foroService.crearReporte({
      tipo_reporte_id: Number(tipoReporteId),
      ...(comentarioId ? { comentario_id: Number(comentarioId) } : { foro_id: Number(foroId) }),
      descripcion: 'Reportado desde la interfaz de la comunidad',
    });
    if (respuesta.resultado === 'ok') {
      guardarReporte(idUsuario, objetivo);
      notificarExito('Reporte enviado. Gracias por avisarnos.');
      return true;
    }
    notificarError('No se pudo enviar el reporte', respuesta.mensaje);
    return false;
  } catch (error) {
    // Mensajes de ReporteController (p. ej. "No puedes reportarte a ti mismo.")
    const status = error.response?.status;
    const mensaje = error.response?.data?.mensaje || error.response?.data?.message;
    if (status === 409 || /ya (lo )?report/i.test(mensaje ?? '')) {
      guardarReporte(idUsuario, objetivo);
      notificarError('Ya lo reportaste', mensaje || 'Este contenido ya fue reportado por ti.');
      return true;
    }
    if (mensaje) notificarError('No se pudo enviar el reporte', mensaje);
    else if (status === 401) notificarError('Inicia sesión', 'Debes iniciar sesión para reportar.');
    else notificarError('Error', 'Hubo un error al procesar el reporte.');
    return false;
  }
};
