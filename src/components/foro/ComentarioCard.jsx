import { useState } from "react";
import ReportarModal from "./ReportarModal";
import { foroService } from "../../services/foroService";

function ComentarioCard({ comentario }) {
  const [mostrarReporte, setMostrarReporte] = useState(false);

  const manejarReporte = async (motivoId) => {
    try {
      const datosReporte = {
        tipo_reporte_id: Number(motivoId), 
        comentario_id: comentario.id_participacion || comentario.id_comentario || comentario.id, // El ID del comentario
        descripcion: "Reportado desde la interfaz", // Opcional o déjalo vacío/null
      };

      console.log("Datos que se enviarán al backend:", datosReporte);
      console.log("Objeto comentario completo:", comentario);

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
      <div className="card shadow-sm mb-3 border-0">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <strong className="text-dark">
              {comentario.usuario
                ? `${comentario.usuario.nombre || ""} ${comentario.usuario.apellido || ""}`.trim()
                : comentario.autor || "Usuario"}
            </strong>
            <small className="text-muted">{comentario.fecha}</small>
          </div>

          <p className="card-text text-secondary mb-3">
            {comentario.comentario || comentario.contenido || ""}
          </p>

          <button
            type="button"
            className="btn btn-link text-danger p-0 text-decoration-none small"
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
