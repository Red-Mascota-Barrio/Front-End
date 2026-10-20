// Iconos del panel con Bootstrap Icons (https://icons.getbootstrap.com)
const ICONOS = {
  dashboard: 'grid-1x2',
  usuarios: 'people',
  usuario: 'person',
  corazon: 'heart',
  calendario: 'calendar-event',
  foro: 'chat-left-text',
  alerta: 'exclamation-triangle',
  salir: 'box-arrow-right',
  campana: 'bell',
  chevron: 'chevron-right',
  pulso: 'activity',
  check: 'check-circle',
  reloj: 'clock',
  info: 'info-circle',
  escudo: 'shield-check',
  lupa: 'search',
  casa: 'house',
  menu: 'list',
  ojo: 'eye',
  editar: 'pencil',
  eliminar: 'trash',
  pausa: 'pause-circle',
  play: 'play-circle',
  actualizar: 'arrow-clockwise',
  mas: 'plus-lg',
  reabrir: 'arrow-counterclockwise',
  externo: 'box-arrow-up-right',
};

export const AdminIcon = ({ nombre, size, className = '' }) => (
  <i
    className={`bi bi-${ICONOS[nombre] ?? nombre} ${className}`}
    style={size ? { fontSize: size } : undefined}
    aria-hidden="true"
  />
);
