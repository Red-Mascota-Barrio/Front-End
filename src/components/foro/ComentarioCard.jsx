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
      <article className="comentario-card">
        <div className="comentario-header">
          <strong>
            {comentario.usuario
              ? `${comentario.usuario.nombre || ""} ${comentario.usuario.apellido || ""}`.trim()
              : comentario.autor || "Usuario"}
          </strong>

          <span className="comentario-fecha">{comentario.fecha}</span>
        </div>

        <p className="comentario-contenido">
          {comentario.comentario || comentario.contenido || ""}
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
