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
          <div 
            className="d-flex align-items-start p-4 bg-white rounded-4 shadow-sm border gap-3" 
            key={e.id}
          >
            <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-3 fs-4 d-flex align-items-center justify-content-center">
              <FaCalendarAlt />
            </div>
            <div className="flex-grow-1 text-start">
              <h6 className="fw-bold text-dark mb-1">{e.titulo ?? e.nombre}</h6>
              <p className="mb-2 text-muted small">{fecha(e.fecha_inicio ?? e.fecha)}</p>
              {e.lugar && (
                <div className="text-secondary small d-flex align-items-center gap-1">
                  <FaMapMarkerAlt className="text-danger" />
                  <span>{e.lugar}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </ListaPestana>
);