import { Button } from 'react-bootstrap';
import { Icono, IconoTipoEvento } from '../common/Icono';
import { aFecha } from '../../utils/admin';
import { claseBadgeTipo, estadoCupos } from '../../utils/eventos';

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// Botón de inscripción según el estado del evento
export const BotonInscripcion = ({ evento, onInscribir, onCancelar, size = 'sm', principal = false }) => {
  const { lleno } = estadoCupos(evento);
  if (evento.inscrito) {
    return (
      <div className="d-flex flex-column align-items-start align-items-sm-end gap-1">
        <span className="badge badge-verde"><Icono nombre="check-circle" /> Inscrito</span>
        {onCancelar && (
          <button type="button" className="btn btn-link btn-sm p-0 text-secondary" onClick={() => onCancelar(evento)}>
            Cancelar inscripción
          </button>
        )}
      </div>
    );
  }
  if (lleno) {
    return <Button size={size} variant="secondary" disabled>Cupos llenos</Button>;
  }
  return (
    <Button size={size} variant={principal ? 'primary' : 'outline-primary'} onClick={() => onInscribir(evento)}>
      {principal ? <>Inscribirme al evento <Icono nombre="arrow-right" /></> : 'Inscribirme'}
    </Button>
  );
};

// Tarjeta de evento en lista (fecha a la izquierda), como en Eventos.html
export default function EventoCard({ evento, onInscribir, onCancelar }) {
  const fecha = aFecha(evento.fecha);
  const { total, lleno, quedan } = estadoCupos(evento);

  return (
    <article className={`evento-card ${evento.inscrito ? 'inscrito' : ''}`}>
      <div className="evento-fecha-barra" aria-label={evento.fecha}>
        <div className="dia">{fecha ? String(fecha.getDate()).padStart(2, '0') : '--'}</div>
        <div className="mes">{fecha ? MESES[fecha.getMonth()] : ''}</div>
      </div>

      <div className="evento-card-cuerpo">
        <h3 title={evento.titulo}>{evento.titulo}</h3>
        <p>{evento.descripcion}</p>
        <div className="evento-card-meta">
          {evento.hora && <span><Icono nombre="clock" /> {evento.hora}</span>}
          {evento.lugar && <span><Icono nombre="geo-alt" /> {evento.lugar}</span>}
          <span className={`badge ${claseBadgeTipo(evento.tipo)}`}>
            <IconoTipoEvento tipo={evento.tipo} /> {evento.tipo}
          </span>
        </div>
      </div>

      <div className="evento-card-accion">
        <BotonInscripcion evento={evento} onInscribir={onInscribir} onCancelar={onCancelar} />
        {total > 0 ? (
          <span className={`evento-cupos ${lleno ? 'lleno' : ''}`}>
            {lleno ? 'Sin cupos' : `${quedan} cupos libres`}
          </span>
        ) : (
          <span className="evento-cupos">{evento.cuposOcupados} inscritos</span>
        )}
      </div>
    </article>
  );
}
