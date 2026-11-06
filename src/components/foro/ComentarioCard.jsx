import { useState } from "react";
import ReportarModal from "./ReportarModal";
import { Icono } from "../common/Icono";
import { useAuth } from "../../context/AuthContext";
import { haceCuanto } from "../../utils/admin";
import { nombreAutor, inicialesAutor, colorAvatar, enviarReporte, yaReporto } from "../../utils/foro";
import ComentarioForm from "./ComentarioForm";

function ComentarioCard({ comentario, onEliminar, onAgregarComentario }) {
  const { user, token } = useAuth();
  const idUsuario = user?.id_usuario;
  const id = comentario.id_participacion ?? comentario.id;
  const fecha = comentario.fecha_participacion ?? comentario.created_at ?? comentario.fecha;
  const autorId = comentario.usuario_id ?? comentario.usuario?.id_usuario ?? comentario.usuario?.id;
  const esPropio = Boolean(token) && autorId !== undefined && Number(autorId) === Number(idUsuario);

  const [mostrarReporte, setMostrarReporte] = useState(false);
  const [reportado, setReportado] = useState(() => yaReporto(idUsuario, { comentarioId: id }));
  const [respondiendo, setRespondiendo] = useState(false);

  const reportar = async (tipo) => {
    if (await enviarReporte({ tipoReporteId: tipo, comentarioId: id, idUsuario })) setReportado(true);
  };

  return (
    <>
      <article className="comentario-item" id={`comentario-${id}`}>
        <div className="d-flex align-items-center gap-3">
          <div className={`avatar-gradiente avatar-sm ${colorAvatar(comentario)}`} aria-hidden="true">
            {inicialesAutor(comentario)}
          </div>
          <div className="flex-grow-1 d-flex flex-column">
            <span className="comentario-autor">{nombreAutor(comentario)}</span>
            {fecha && <span className="comentario-fecha">{haceCuanto(fecha)}</span>}
          </div>
          <div className="comentario-acciones">
            {token && id && (
              <button type="button" className="btn-responder-comentario" onClick={() => setRespondiendo((actual) => !actual)}>
                <Icono nombre="reply" /> {respondiendo ? "Cerrar" : "Responder"}
              </button>
            )}
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
        </div>
        <p className="comentario-cuerpo">{comentario.comentario || comentario.contenido || ""}</p>
        {respondiendo && (
          <ComentarioForm
            compacto
            placeholder={`Responder a ${nombreAutor(comentario)}…`}
            onCancelar={() => setRespondiendo(false)}
            onAgregarComentario={async (nuevo) => {
              const ok = await onAgregarComentario(nuevo, id);
              if (ok) setRespondiendo(false);
              return ok;
            }}
          />
        )}
      </article>

      {comentario.respuestas?.length > 0 && (
        <div className="comentario-respuestas" aria-label={`Respuestas a ${nombreAutor(comentario)}`}>
          {comentario.respuestas.map((respuesta) => (
            <ComentarioCard
              key={respuesta.id_participacion ?? respuesta.id}
              comentario={respuesta}
              onEliminar={onEliminar}
              onAgregarComentario={onAgregarComentario}
            />
          ))}
        </div>
      )}

      {mostrarReporte && (
        <ReportarModal onCerrar={() => setMostrarReporte(false)} onReportar={reportar} />
      )}
    </>
  );
}

export default ComentarioCard;
