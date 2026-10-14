import { useState } from "react";

function ReportarModal({ onCerrar, onReportar }) {
  const [motivo, setMotivo] = useState("1");

  const manejarReporte = (e) => {
    e.preventDefault();

    onReportar(motivo);

    onCerrar();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-foro">

        <div className="modal-header">
          <h2>Reportar comentario</h2>

          <button
            type="button"
            className="btn-cerrar-modal"
            onClick={onCerrar}
          >
            ×
          </button>
        </div>

        <form
          className="form-hilo"
          onSubmit={manejarReporte}
        >

          <p className="reporte-descripcion">
            ¿Por qué quieres reportar este comentario?
          </p>

          <div className="opciones-reporte">

            <label>
              <input
                type="radio"
                name="motivo"
                value="spam"
                checked={motivo === "1"}
                onChange={(e) => setMotivo(e.target.value)}
              />
              Publicidad o Spam
            </label>

            <label>
              <input
                type="radio"
                name="motivo"
                value="2"
                checked={motivo === "2"}
                onChange={(e) => setMotivo(e.target.value)}
              />
              Lenguaje ofensivo o acoso
            </label>

            <label>
              <input
                type="radio"
                name="motivo"
                value="3"
                checked={motivo === "3"}
                onChange={(e) => setMotivo(e.target.value)}
              />
              Información falsa o peligrosa
            </label>

            <label>
              <input
                type="radio"
                name="motivo"
                value="4"
                checked={motivo === "4"}
                onChange={(e) => setMotivo(e.target.value)}
              />
              Otro motivo
            </label>

          </div>

          <div className="modal-acciones">

            <button
              type="button"
              className="btn-cancelar"
              onClick={onCerrar}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="btn-reportar"
            >
              Reportar
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}

export default ReportarModal;

