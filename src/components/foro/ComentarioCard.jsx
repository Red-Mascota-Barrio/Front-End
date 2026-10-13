import { useState } from "react";
import ReportarModal from "./ReportarModal";

function ComentarioCard({ comentario }) {
  const [mostrarReporte, setMostrarReporte] = useState(false);

  const manejarReporte = (motivo) => {
    const reportesGuardados = JSON.parse(
      localStorage.getItem("reportesForo") || "[]"
    );

    const nuevoReporte = {
      id: Date.now(),
      comentarioId: comentario.id,
      motivo: motivo,
      fecha: new Date().toLocaleString(),
    };

    const nuevosReportes = [
      ...reportesGuardados,
      nuevoReporte,
    ];

    localStorage.setItem(
      "reportesForo",
      JSON.stringify(nuevosReportes)
    );

    console.log("Reporte guardado:", nuevoReporte);
  };

  return (
    <>
      <div className="card shadow-sm border-0 rounded-4 p-4 bg-white mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <strong className="text-dark fw-bold">{comentario.autor}</strong>
          <small className="text-muted">{comentario.fecha}</small>
        </div>

        <p className="text-secondary mb-3 small">
          {comentario.contenido}
        </p>

        <div className="text-end">
          <button
            type="button"
            className="btn btn-outline-danger btn-sm rounded-pill px-3"
            onClick={() => setMostrarReporte(true)}
          >
            Reportar
          </button>
        </div>
      </div>

      {mostrarReporte && (
        <ReportarModal
          onCerrar={() => setMostrarReporte(false)}
          onReportar={manejarReporte}
        />
      )}
    </>
  );
}

export default ComentarioCard;