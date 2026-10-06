import { useState } from "react";

function ReportarModal({ onCerrar, onReportar }) {
  const [motivo, setMotivo] = useState("spam");

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
                checked={motivo === "spam"}
                onChange={(e) => setMotivo(e.target.value)}
              />
              Spam
            </label>

            <label>
              <input
                type="radio"
                name="motivo"
                value="inapropiado"
                checked={motivo === "inapropiado"}
                onChange={(e) => setMotivo(e.target.value)}
              />
              Contenido inapropiado
            </label>

            <label>
              <input
                type="radio"
                name="motivo"
                value="acoso"
                checked={motivo === "acoso"}
                onChange={(e) => setMotivo(e.target.value)}
              />
              Acoso o comportamiento ofensivo
            </label>

            <label>
              <input
                type="radio"
                name="motivo"
                value="otro"
                checked={motivo === "otro"}
                onChange={(e) => setMotivo(e.target.value)}
              />
              Otro
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

