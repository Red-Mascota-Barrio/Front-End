import { FaComment } from 'react-icons/fa';
import { perfilService } from '../../services/perfilService';
import { ListaPestana } from './ListaPestana';

const fecha = (f) => (f ? new Date(f).toLocaleDateString('es-CO', { dateStyle: 'medium' }) : '');

export const TabActividadForo = () => (
  <ListaPestana cargar={perfilService.actividadForo} vacio="Todavía no tienes actividad en el foro 💬">
    {(actividad) => (
      <div className="d-flex flex-column gap-3">
        {actividad.map((a) => (
          <div 
            className="d-flex align-items-start p-4 bg-white rounded-4 shadow-sm border gap-3" 
            key={`${a.tipo ?? 'item'}-${a.id}`}
          >
            <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-3 fs-4 d-flex align-items-center justify-content-center">
              <FaComment />
            </div>
            <div className="flex-grow-1 text-start">
              <h6 className="fw-bold text-dark mb-1">{a.titulo ?? a.foro?.titulo ?? 'Publicación'}</h6>
              <p className="mb-2 text-muted small">{a.contenido ?? a.comentario}</p>
              <small className="text-secondary opacity-75">{fecha(a.created_at)}</small>
            </div>
          </div>
        ))}
      </div>
    )}
  </ListaPestana>
);