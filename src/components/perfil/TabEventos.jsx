import { perfilService } from '../../services/perfilService';
import { adaptarEvento } from '../../services/eventosService';
import { fechaCorta } from '../../utils/admin';
import { Icono, IconoTipoEvento } from '../common/Icono';
import { ListaPestana } from './ListaPestana';

// Eventos con inscripción activa (GET /mis-eventos)
export const TabEventos = () => (
  <ListaPestana
    cargar={perfilService.misEventos}
    vacio={{
      icono: 'calendar-event',
      titulo: 'Aún no te has inscrito a ningún evento',
      sub: 'Encuentra jornadas de vacunación y ferias de adopción en tu barrio.',
      accion: { texto: 'Ver eventos disponibles', to: '/eventos' },
    }}
  >
    {(eventos) => (
      <div className="lista-tarjeta">
        {eventos.map((original, i) => {
          const e = adaptarEvento(original);
          return (
            <div className="actividad-item" key={e.id ?? i}>
              <div className="actividad-icono"><IconoTipoEvento tipo={e.tipo} /></div>
              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <h3 className="actividad-titulo text-truncate">{e.titulo}</h3>
                <p className="actividad-meta">
                  <Icono nombre="calendar3" /> {e.fecha ? fechaCorta(e.fecha) : 'Fecha por definir'}
                  {e.hora && <> · <Icono nombre="clock" /> {e.hora}</>}
                  {e.lugar && <> · <Icono nombre="geo-alt" /> {e.lugar}</>}
                </p>
              </div>
              <span className="badge badge-verde flex-shrink-0"><Icono nombre="check-circle" /> Inscrito</span>
            </div>
          );
        })}
      </div>
    )}
  </ListaPestana>
);
