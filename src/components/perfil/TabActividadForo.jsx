import { FaComment } from 'react-icons/fa';
import { perfilService } from '../../services/perfilService';
import { ListaPestana } from './ListaPestana';

const fecha = (f) => (f ? new Date(f).toLocaleDateString('es-CO', { dateStyle: 'medium' }) : '');

export const TabActividadForo = () => (
  <ListaPestana cargar={perfilService.actividadForo} vacio="Todavía no tienes actividad en el foro 💬">
    {(actividad) => (
      <div className="d-flex flex-column gap-3">
        {actividad.map((a) => (
          <div className="inicio-card perfil-item perfil-fila" key={`${a.tipo ?? 'item'}-${a.id}`}>
            <FaComment className="perfil-fila-icono" />
            <div className="flex-grow-1 text-start">
              <strong>{a.titulo ?? a.foro?.titulo ?? 'Publicación'}</strong>
              <p className="mb-1 text-muted small">{a.contenido ?? a.comentario}</p>
              <small className="text-muted">{fecha(a.created_at)}</small>
            </div>
          </div>
        ))}
      </div>
    )}
  </ListaPestana>
);
