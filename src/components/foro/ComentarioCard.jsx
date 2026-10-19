import { useState } from "react";
import ReportarModal from "./ReportarModal";
import { Icono } from "../common/Icono";
import { haceCuanto } from "../../utils/admin";
import { nombreAutor, inicialesAutor, colorAvatar, enviarReporte } from "../../utils/foro";

function ComentarioCard({ comentario }) {
  const [mostrarReporte, setMostrarReporte] = useState(false);
  const id = comentario.id_participacion ?? comentario.id;
  const fecha = comentario.fecha_participacion ?? comentario.created_at ?? comentario.fecha;

  return (
    <>
      <article className="comentario-item">
        <div className="d-flex align-items-center gap-3">
          <div className={`avatar-gradiente avatar-sm ${colorAvatar(comentario)}`} aria-hidden="true">
            {inicialesAutor(comentario)}
          </div>
          <div className="flex-grow-1 d-flex flex-column">
            <span className="comentario-autor">{nombreAutor(comentario)}</span>
            {fecha && <span className="comentario-fecha">{haceCuanto(fecha)}</span>}
          </div>
          {id && (
            <button type="button" className="btn-reportar" onClick={() => setMostrarReporte(true)}>
              <Icono nombre="flag" /> Reportar
            </button>
          )}
        </div>
        <p className="comentario-cuerpo">{comentario.comentario || comentario.contenido || ""}</p>
      </article>

      {mostrarReporte && (
        <ReportarModal
          onCerrar={() => setMostrarReporte(false)}
          onReportar={(tipo) => enviarReporte({ tipoReporteId: tipo, comentarioId: id })}
        />
      )}
    </>
  );
}

export default ComentarioCard;
