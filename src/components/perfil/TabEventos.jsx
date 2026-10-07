import { FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { perfilService } from '../../services/perfilService';
import { ListaPestana } from './ListaPestana';

const fecha = (f) =>
  f ? new Date(f).toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' }) : 'Fecha por definir';

export const TabEventos = () => (
  <ListaPestana cargar={perfilService.misEventos} vacio="No estás inscrito en ningún evento 📅">
    {(eventos) => (
      <div className="d-flex flex-column gap-3">
        {eventos.map((e) => (
          <div className="inicio-card perfil-item perfil-fila" key={e.id}>
            <FaCalendarAlt className="perfil-fila-icono" />
            <div className="flex-grow-1 text-start">
              <strong>{e.titulo ?? e.nombre}</strong>
              <p className="mb-1 text-muted small">{fecha(e.fecha_inicio ?? e.fecha)}</p>
              {e.lugar && (
                <small className="text-muted"><FaMapMarkerAlt className="me-1" />{e.lugar}</small>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </ListaPestana>
);
