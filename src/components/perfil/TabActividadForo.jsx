import { useCallback } from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { perfilService } from '../../services/perfilService';
import { haceCuanto } from '../../utils/admin';
import { Icono } from '../common/Icono';
import { ListaPestana } from './ListaPestana';

// Hilos que publicó el usuario (GET /foros filtrado por usuario_id)
export const TabActividadForo = ({ idUsuario }) => {
  const cargar = useCallback(() => perfilService.actividadForo(idUsuario), [idUsuario]);

  return (
    <ListaPestana
      cargar={cargar}
      vacio={{
        icono: 'chat-left-text',
        titulo: 'Todavía no has publicado en el foro',
        sub: 'Haz una pregunta o comparte tu experiencia con otros dueños.',
        accion: { texto: 'Ir al foro', to: '/foro' },
      }}
    >
      {(hilos) => (
        <div className="lista-tarjeta">
          {hilos.map((h) => (
            <div className="actividad-item" key={h.id_foro}>
              <div className="actividad-icono"><Icono nombre="pin-angle" /></div>
              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <h3 className="actividad-titulo text-truncate">{h.titulo}</h3>
                <p className="actividad-meta text-truncate">
                  {h.numero_comentarios ?? 0} respuestas · {haceCuanto(h.fecha_creacion)}
                </p>
              </div>
              <Button as={Link} to={`/foro/${h.id_foro}`} variant="light" size="sm" className="flex-shrink-0">
                Ver hilo
              </Button>
            </div>
          ))}
        </div>
      )}
    </ListaPestana>
  );
};
