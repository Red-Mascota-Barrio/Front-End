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
      <article className="comentario-card">

        <div className="comentario-header">
          <strong>{comentario.autor}</strong>

          <span className="comentario-fecha">
            {comentario.fecha}
          </span>
        </div>

        <p className="comentario-contenido">
          {comentario.contenido}
        </p>

        <button
          type="button"
          className="btn-reportar-comentario"
          onClick={() => setMostrarReporte(true)}
        >
          Reportar
        </button>

      </article>

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
