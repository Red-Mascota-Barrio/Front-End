
export default function VistaCalendario({ eventos }) {
  return (
    <div className="card p-3">
      <h5>Calendario de Próximos Eventos</h5>
      <div className="list-group list-group-flush mt-2">
        {eventos.map((evt) => (
          <div key={evt.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{evt.fecha}</strong> — {evt.titulo}
              <div className="small text-muted"> {evt.lugar}</div>
            </div>
            <span className="badge bg-primary rounded-pill">{evt.tipo}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

