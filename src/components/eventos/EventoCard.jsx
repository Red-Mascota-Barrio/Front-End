export default function EventoCard({ evento, onInscribir }) {
  const total = evento.cuposTotales || 0;
  const cuposAgotados = total > 0 && evento.cuposOcupados >= total;
  const porcentaje = total > 0 ? Math.min(100, (evento.cuposOcupados / total) * 100) : 0;

  return (
    <div className={`card h-100 ${evento.destacado ? 'border-warning shadow-sm' : ''}`}>
      <div className="card-body d-flex flex-column">
        <div className="mb-1">
          {evento.destacado && (
            <span className="badge bg-warning text-dark">⭐ Evento destacado</span>
          )}
          <span className="badge bg-info text-dark float-end">{evento.tipo}</span>
        </div>

        <h5 className="card-title mt-1">{evento.titulo}</h5>
        <p className="card-text text-muted small mb-2">{evento.descripcion}</p>

        <p className="small mb-1">📅 {evento.fecha} &nbsp; 🕒 {evento.hora}</p>
        <p className="small mb-2">📍 {evento.lugar}</p>

        {/* Indicador de cupos */}
        <div className="mb-3 mt-auto">
          <small className="text-muted d-block">
            Cupos: {evento.cuposOcupados} / {total}
          </small>
          <div className="progress" style={{ height: '6px' }}>
            <div
              className={`progress-bar ${cuposAgotados ? 'bg-danger' : 'bg-success'}`}
              style={{ width: `${porcentaje}%` }}
            ></div>
          </div>
        </div>

        {/* Botón según estado */}
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
