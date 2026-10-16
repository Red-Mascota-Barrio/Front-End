import { useState } from "react";

function ReportarModal({ onCerrar, onReportar }) {
  const [motivo, setMotivo] = useState("1");

  const manejarReporte = (e) => {
    e.preventDefault();
    onReportar(motivo);
    onCerrar();
  };

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">Reportar comentario</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onCerrar}
            ></button>
          </div>

          <form onSubmit={manejarReporte}>
            <div className="modal-body">
              <p className="text-secondary mb-3">
                ¿Por qué quieres reportar este comentario?
              </p>

              <div className="d-flex flex-column gap-2">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="motivo"
                    id="motivo1"
                    value="1"
                    checked={motivo === "1"}
                    onChange={(e) => setMotivo(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="motivo1">
                    Publicidad o Spam
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="motivo"
                    id="motivo2"
                    value="2"
                    checked={motivo === "2"}
                    onChange={(e) => setMotivo(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="motivo2">
                    Lenguaje ofensivo o acoso
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="motivo"
                    id="motivo3"
                    value="3"
                    checked={motivo === "3"}
                    onChange={(e) => setMotivo(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="motivo3">
                    Información falsa o peligrosa
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="motivo"
                    id="motivo4"
                    value="4"
                    checked={motivo === "4"}
                    onChange={(e) => setMotivo(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="motivo4">
                    Otro motivo
                  </label>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-light border"
                onClick={onCerrar}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-danger">
                Reportar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ReportarModal;

