import { claseTipoEvento } from './admin';

const BADGE = { primary: 'badge-azul', warning: 'badge-naranja', secondary: 'badge-gris', success: 'badge-verde' };

// Clase de badge del mockup según el tipo de evento
export const claseBadgeTipo = (tipo) => BADGE[claseTipoEvento(tipo)] ?? 'badge-verde';

// Cupos del evento (total 0 = sin límite)
export const estadoCupos = (evento) => {
  const total = evento.cuposTotales || 0;
  const lleno = total > 0 && evento.cuposOcupados >= total;
  const quedan = total > 0 ? Math.max(0, total - evento.cuposOcupados) : null;
  return { total, lleno, quedan };
};
