import { FaDog, FaCat, FaPaw } from 'react-icons/fa';
import { tipoEspecie, iconoTipoEvento } from '../../utils/admin';

// Ícono de Bootstrap Icons: <Icono nombre="calendar-event" />  (https://icons.getbootstrap.com)
export const Icono = ({ nombre, className = '', size, ...rest }) => (
  <i
    className={`bi bi-${nombre} ${className}`.trim()}
    style={size ? { fontSize: size } : undefined}
    aria-hidden="true"
    {...rest}
  />
);

// Bootstrap Icons no trae animales, así que para las especies se usan los de react-icons
const ESPECIES = { perro: FaDog, gato: FaCat, otro: FaPaw };

export const IconoEspecie = ({ especie, className = '', size }) => {
  const Componente = ESPECIES[tipoEspecie(especie)];
  return <Componente className={className} size={size} aria-hidden="true" />;
};

export const IconoTipoEvento = ({ tipo, ...props }) => <Icono nombre={iconoTipoEvento(tipo)} {...props} />;
