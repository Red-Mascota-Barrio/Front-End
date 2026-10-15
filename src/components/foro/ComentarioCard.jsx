import { useState } from "react";
import ReportarModal from "./ReportarModal";
import { foroService } from "../../services/foroService";

function ComentarioCard({ comentario }) {
  const [mostrarReporte, setMostrarReporte] = useState(false);

  const manejarReporte = async (motivoId) => {
    try {
      const datosReporte = {
        tipo_reporte_id: Number(motivoId), // El número 1, 2, 3 o 4 del radio button
        comentario_id: comentario.id_comentario || comentario.id, // El ID del comentario
        descripcion: "Reportado desde la interfaz", // Opcional o déjalo vacío/null
      };

      const respuesta = await foroService.crearReporte(datosReporte);

      if (respuesta.resultado === "ok") {
        alert("¡Reporte enviado con éxito! Gracias por avisarnos.");
      } else {
        alert(respuesta.mensaje || "No se pudo enviar el reporte.");
      }
    } catch (error) {
      console.error("Error al enviar el reporte:", error);
      alert("Hubo un error al procesar el reporte.");
    }
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