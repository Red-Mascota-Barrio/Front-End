
export default function EventoCard({ evento, onInscribir }) {
  const cuposAgotados = evento.cuposOcupados >= evento.cuposTotales;

  return (
    <div className={`card h-100 ${evento.destacado ? 'border-warning shadow-sm' : ''}`}>
      <div className="card-body">
        {evento.destacado && (
          <span className="badge bg-warning text-dark mb-2"> Evento Destacado</span>
        )}
        <span className="badge bg-info text-dark float-end">{evento.tipo}</span>
        
        <h5 className="card-title mt-1">{evento.titulo}</h5>
        <p className="card-text text-muted small mb-2">{evento.descripcion}</p>
        
        <p className="small mb-1"> {evento.fecha}  {evento.hora}</p>
        <p className="small mb-2"> {evento.lugar}</p>

        //Indicador de Cupos //
        <div className="mb-3">
          <small className="text-muted d-block">
            Cupos: {evento.cuposOcupados} / {evento.cuposTotales}
          </small>
          <div className="progress" style={{ height: '6px' }}>
            <div
              className={`progress-bar ${cuposAgotados ? 'bg-danger' : 'bg-success'}`}
              style={{ width: `${(evento.cuposOcupados / evento.cuposTotales) * 100}%` }}
            ></div>
          </div>
        </div>

        //Renderizado condicional de botones //
        {evento.inscrito ? (
          <button className="btn btn-outline-success w-100" disabled>
            ✓ Ya estás inscrito
          </button>
        ) : cuposAgotados ? (
          <button className="btn btn-secondary w-100" disabled>
            Cupos llenos
          </button>
        ) : (
          <button className="btn btn-primary w-100" onClick={() => onInscribir(evento)}>
            Inscribirme
          </button>
        )}
      </div>
    </div>
  );
}

