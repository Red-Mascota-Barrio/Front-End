export default function VistaCalendario({ eventos, onInscribir }) {
  const ordenados = [...eventos].sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)));

  return (
    <div className="card shadow-sm border-0 rounded-4 p-4 bg-white">
      <h5 className="fw-bold text-dark mb-4">📅 Calendario de próximos eventos</h5>
      {ordenados.length === 0 ? (
        <div className="text-center py-4 bg-light rounded-3">
          <p className="text-muted mb-0">No hay eventos para mostrar.</p>
        </div>
      ) : (
        <div className="list-group list-group-flush gap-3">
          {ordenados.map((evt) => {
            const lleno = evt.cuposTotales > 0 && evt.cuposOcupados >= evt.cuposTotales;
            return (
              <div 
                key={evt.id} 
                className="list-group-item d-flex justify-content-between align-items-center gap-3 flex-wrap p-3 bg-light rounded-3 border"
              >
                <div>
                  <div className="text-dark mb-1">
                    <strong className="text-primary me-2">{evt.fecha}</strong> 
                    <span className="text-muted">({evt.hora})</span> — <span className="fw-bold">{evt.titulo}</span>
                  </div>
                  <div className="small text-secondary">📍 {evt.lugar}</div>
                </div>
                
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-info bg-opacity-10 text-info border border-info rounded-pill px-3 py-2 fw-medium">
                    {evt.tipo}
                  </span>
                  
                  {evt.inscrito ? (
                    <span className="badge bg-success bg-opacity-10 text-success border border-success rounded-pill px-3 py-2 fw-medium">
                      ✓ Inscrito
                    </span>
                  ) : lleno ? (
                    <span className="badge bg-secondary rounded-pill px-3 py-2 fw-medium">
                      Lleno
                    </span>
                  ) : (
                    <button 
                      className="btn btn-sm btn-primary rounded-pill px-3 fw-medium shadow-sm" 
                      onClick={() => onInscribir?.(evt)}
                    >
                      Inscribirme
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}