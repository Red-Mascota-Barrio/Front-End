export default function VistaCalendario({ eventos, onInscribir }) {
  const ordenados = [...eventos].sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)));

  return (
    <div className="card p-3">
      <h5>Calendario de próximos eventos</h5>
      {ordenados.length === 0 ? (
        <p className="text-muted mb-0 mt-2">No hay eventos para mostrar.</p>
      ) : (
        <div className="list-group list-group-flush mt-2">
          {ordenados.map((evt) => {
            const lleno = evt.cuposTotales > 0 && evt.cuposOcupados >= evt.cuposTotales;
            return (
              <div key={evt.id} className="list-group-item d-flex justify-content-between align-items-center gap-2 flex-wrap">
                <div>
                  <strong>{evt.fecha}</strong> {evt.hora} — {evt.titulo}
                  <div className="small text-muted">📍 {evt.lugar}</div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-primary rounded-pill">{evt.tipo}</span>
                  {evt.inscrito ? (
                    <span className="badge bg-success">Inscrito</span>
                  ) : lleno ? (
                    <span className="badge bg-secondary">Lleno</span>
                  ) : (
                    <button className="btn btn-sm btn-primary" onClick={() => onInscribir?.(evt)}>
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
