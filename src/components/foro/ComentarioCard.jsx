import { useState } from "react";
import ReportarModal from "./ReportarModal";
import { Icono } from "../common/Icono";
import { useAuth } from "../../context/AuthContext";
import { haceCuanto } from "../../utils/admin";
import { nombreAutor, inicialesAutor, colorAvatar, enviarReporte, yaReporto } from "../../utils/foro";

function ComentarioCard({ comentario, onEliminar }) {
  const { user, token } = useAuth();
  const idUsuario = user?.id_usuario;
  const id = comentario.id_participacion ?? comentario.id;
  const fecha = comentario.fecha_participacion ?? comentario.created_at ?? comentario.fecha;
  const autorId = comentario.usuario_id ?? comentario.usuario?.id_usuario ?? comentario.usuario?.id;
  const esPropio = Boolean(token) && autorId !== undefined && Number(autorId) === Number(idUsuario);

  const [mostrarReporte, setMostrarReporte] = useState(false);
  const [reportado, setReportado] = useState(() => yaReporto(idUsuario, { comentarioId: id }));

  const reportar = async (tipo) => {
    if (await enviarReporte({ tipoReporteId: tipo, comentarioId: id, idUsuario })) setReportado(true);
  };

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
          {id && esPropio && onEliminar && (
            <button type="button" className="btn-reportar" onClick={() => onEliminar(comentario)}>
              <Icono nombre="trash" /> Eliminar
            </button>
          )}
          {id && !esPropio && (
            reportado ? (
              <span className="btn-reportar" aria-disabled="true" style={{ opacity: 0.6, cursor: "default" }}>
                <Icono nombre="flag-fill" /> Reportado
              </span>
            ) : (
              <button type="button" className="btn-reportar" onClick={() => setMostrarReporte(true)}>
                <Icono nombre="flag" /> Reportar
              </button>
            )
          )}
        </div>
        <p className="comentario-cuerpo">{comentario.comentario || comentario.contenido || ""}</p>
      </article>

      {mostrarReporte && (
        <ReportarModal onCerrar={() => setMostrarReporte(false)} onReportar={reportar} />
      )}
    </>
  );
}

export default ComentarioCard;
