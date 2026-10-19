import { useState } from "react";
import ReportarModal from "./ReportarModal";
import { foroService } from "../../services/foroService";

function ComentarioCard({ comentario }) {
  const [mostrarReporte, setMostrarReporte] = useState(false);

  const manejarReporte = async (motivoId) => {
    try {
      const idComentarioValido = Number(
        comentario.id_participacion ||
        comentario.id_comentario ||
        comentario.id_foro_comentario ||
        comentario.id ||
        0
      );

      if (!idComentarioValido) {
        alert("No se pudo identificar el ID del comentario a reportar.");
        return;
      }

      const datosReporte = {
        tipo_reporte_id: Number(motivoId),
        motivo_id: Number(motivoId),
        comentario_id: idComentarioValido,
        id_comentario: idComentarioValido,
        descripcion: "Reportado desde la interfaz de la comunidad",
      };

      const respuesta = await foroService.crearReporte(datosReporte);

      if (
        respuesta.resultado === "ok" ||
        respuesta.status === "success" ||
        respuesta.success
      ) {
        alert("¡Reporte enviado con éxito! Gracias por avisarnos.");
      } else {
        alert(respuesta.mensaje || respuesta.message || "No se pudo enviar el reporte.");
      }
    } catch (error) {
      console.error("Error al enviar el reporte:", error.response?.data || error); //aca es donde manda el mensaje 

      // Mostrar directamente el mensaje de Laravel (ej: "No puedes reportarte a ti mismo.")
      const mensajeBackend = 
        error.response?.data?.mensaje || 
        error.response?.data?.message;

      if (mensajeBackend) {
        alert(mensajeBackend);
      } else if (error.response?.status === 401) {
        alert("Debes iniciar sesión para reportar un comentario.");
      } else {
        alert("Hubo un error al procesar el reporte.");
      }
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