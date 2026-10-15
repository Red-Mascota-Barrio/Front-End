function ForoHeader({ onCrearHilo }) {
  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
      <div>
        <h1 className="fw-bold mb-1">Foro Comunitario</h1>
        <p className="text-muted mb-0">
          Comparte ideas, preguntas y experiencias con la comunidad.
        </p>
      </div>

      <button
        className="btn btn-foro-primary px-4 py-2"
        onClick={onCrearHilo}
      >
        Crear nuevo hilo
      </button>
    </div>
  );
}

export default ForoHeader;