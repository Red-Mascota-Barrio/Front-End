export default function EventoCard({ evento, onInscribir }) {
  const total = evento.cuposTotales || 0;
  const cuposAgotados = total > 0 && evento.cuposOcupados >= total;
  const porcentaje = total > 0 ? Math.min(100, (evento.cuposOcupados / total) * 100) : 0;

  return (
    <div className={`card h-100 shadow-sm border-0 rounded-4 overflow-hidden ${evento.destacado ? 'border border-warning border-2' : ''}`}>
      <div className="card-body d-flex flex-column p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          {evento.destacado ? (
            <span className="badge bg-warning bg-opacity-10 text-warning border border-warning rounded-pill px-3 py-2 fw-medium">
              ⭐ Destacado
            </span>
          ) : <span />}
          <span className="badge bg-info bg-opacity-10 text-info border border-info rounded-pill px-3 py-2 fw-medium ms-auto">
            {evento.tipo}
          </span>
        </div>

        <h5 className="card-title fw-bold text-dark mb-2">{evento.titulo}</h5>
        <p className="card-text text-muted small mb-4 flex-grow-1">{evento.descripcion}</p>

        <div className="bg-light p-3 rounded-3 mb-3 small text-secondary">
          <div className="mb-1">📅 <strong>Fecha:</strong> {evento.fecha} &nbsp; 🕒 <strong>Hora:</strong> {evento.hora}</div>
          <div>📍 <strong>Lugar:</strong> {evento.lugar}</div>
        </div>

        {/* Indicador de cupos */}
        <div className="mb-4 mt-auto">
          <div className="d-flex justify-content-between small text-muted mb-1">
            <span>Cupos ocupados</span>
            <span className="fw-bold">{evento.cuposOcupados} / {total}</span>
          </div>
          <div className="progress rounded-pill" style={{ height: '8px' }}>
            <div
              className={`progress-bar rounded-pill ${cuposAgotados ? 'bg-danger' : 'bg-success'}`}
              style={{ width: `${porcentaje}%` }}
            ></div>
          </div>
        </div>

        {/* Botón según estado */}
        {evento.inscrito ? (
          <button className="btn btn-outline-success rounded-pill w-100 fw-medium" disabled>
            ✓ Ya estás inscrito
          </button>
        ) : cuposAgotados ? (
          <button className="btn btn-secondary rounded-pill w-100 fw-medium" disabled>
            Cupos llenos
          </button>
        ) : (
          <button className="btn btn-primary rounded-pill w-100 fw-medium shadow-sm" onClick={() => onInscribir(evento)}>
            Inscribirme
          </button>
        )}
      </div>
    </div>
  );
}