function ForoHeader({ onCrearHilo }) {
  return (
    <header className="foro-header">
      <div>
        <h1>Foro Comunitario</h1>

        <p>
          Comparte ideas, preguntas y experiencias con la comunidad.
        </p>
      </div>

      <button
        className="btn-crear-hilo"
        onClick={onCrearHilo}
      >
        + Crear nuevo hilo
      </button>
    </header>
  );
}

export default ForoHeader;
