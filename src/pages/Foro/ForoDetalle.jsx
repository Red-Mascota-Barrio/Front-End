import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Container, Spinner } from "react-bootstrap";

import { AppNavbar } from "../../components/layout/AppNavbar";
import { Footer } from "../../components/layout/Footer";
import BadgeForo from "../../components/foro/BadgeForo";
import ReportarModal from "../../components/foro/ReportarModal";
import { Icono, IconoEspecie } from "../../components/common/Icono";
import ComentarioCard from "../../components/foro/ComentarioCard";
import ComentarioForm from "../../components/foro/ComentarioForm";

import { foroService } from "../../services/foroService.js";
import { useAuth } from "../../context/AuthContext";
import { fechaCorta, notificarError, notificarExito, confirmar } from "../../utils/admin";
import {
  idHilo, categoriaDeHilo, nombreCategoria, especieDeCategoria,
  nombreAutor, inicialesAutor, colorAvatar, enviarReporte, yaReporto,
} from "../../utils/foro";
import "../../styles/foro.css";

const Pagina = ({ children }) => (
  <div className="d-flex flex-column min-vh-100">
    <AppNavbar />
    <main className="flex-grow-1">
      <Container className="py-5" style={{ maxWidth: 820 }}>
        <Link to="/foro" className="btn-volver"><Icono nombre="arrow-left" /> Volver al foro</Link>
        {children}
      </Container>
    </main>
    <Footer />
  </div>
);

function ForoDetalle() {
  const { id } = useParams();
  const { user, token } = useAuth();

  const [hilo, setHilo] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [reportando, setReportando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [hiloReportado, setHiloReportado] = useState(false);

  useEffect(() => {
    let activo = true;
    foroService
      .obtenerPorId(id)
      .then((respuesta) => {
        if (!activo) return;
        const datosHilo = respuesta.datos || respuesta.data || respuesta;
        setHilo(datosHilo);
        setHiloReportado(yaReporto(user?.id_usuario, { foroId: datosHilo.id_foro ?? datosHilo.id ?? id }));
        setComentarios(
          datosHilo.comentarios_principales || datosHilo.comentariosPrincipales || datosHilo.comentarios || [],
        );
      })
      .catch((error) => console.error("Error al cargar el detalle del hilo:", error))
      .finally(() => activo && setCargando(false));

    return () => { activo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const agregarComentario = async (nuevoComentario) => {
    try {
      const respuesta = await foroService.crearComentario(idHilo(hilo) || id, nuevoComentario);
      const guardado = respuesta.datos || respuesta.data || respuesta;
      setComentarios((prev) => [...prev, { ...guardado, usuario: guardado.usuario ?? user }]);
      setHilo((prev) => ({ ...prev, numero_comentarios: (Number(prev?.numero_comentarios) || comentarios.length) + 1 }));
      return true;
    } catch (error) {
      console.error("Error al publicar el comentario:", error);
      const data = error.response?.data;
      if (error.response?.status === 422) {
        notificarError("Revisa tu comentario", Object.values(data?.errors ?? data?.errores ?? {}).flat().join(" ") || data?.mensaje);
      } else if (error.response?.status === 401) {
        notificarError("Inicia sesión", "Debes iniciar sesión para publicar un comentario.");
      } else {
        notificarError("Error", "Hubo un error al guardar tu comentario.");
      }
      return false;
    }
  };

  const eliminarComentario = async (comentario) => {
    const idComentario = comentario.id_participacion ?? comentario.id;
    const ok = await confirmar({
      titulo: "¿Eliminar tu comentario?",
      texto: "Esta acción no se puede deshacer.",
      boton: "Eliminar",
      peligro: true,
    });
    if (!ok) return;
    try {
      await foroService.eliminarComentario(idComentario);
      setComentarios((prev) => prev.filter((c) => (c.id_participacion ?? c.id) !== idComentario));
      setHilo((prev) => ({ ...prev, numero_comentarios: Math.max(0, (Number(prev?.numero_comentarios) || comentarios.length) - 1) }));
      notificarExito("Comentario eliminado");
    } catch (error) {
      const data = error.response?.data;
      notificarError("No se pudo eliminar", data?.mensaje || data?.message || "Intenta de nuevo más tarde.");
    }
  };

  if (cargando) {
    return (
      <Pagina>
        <div className="text-center py-5">
          <Spinner animation="border" role="status" />
          <p className="mt-3 text-muted">Cargando hilo…</p>
        </div>
      </Pagina>
    );
  }

  if (!hilo) {
    return (
      <Pagina>
        <div className="estado-vacio publicacion-principal">
          <div className="estado-vacio-icono"><Icono nombre="search" /></div>
          <h3>Hilo no encontrado</h3>
          <p>Puede que haya sido eliminado o que el enlace sea incorrecto.</p>
          <Link to="/foro" className="btn btn-primary">Ver todos los hilos</Link>
        </div>
      </Pagina>
    );
  }

  const cat = categoriaDeHilo(hilo);
  const nombreCat = nombreCategoria(cat);
  const respuestas = hilo.numero_comentarios ?? comentarios.length;

  return (
    <Pagina>
      <article className="publicacion-principal">
        <div className="d-flex align-items-center gap-3">
          <div className={`avatar-gradiente ${colorAvatar(hilo)}`} aria-hidden="true">{inicialesAutor(hilo)}</div>
          <div className="flex-grow-1">
            <div className="publicacion-autor">{nombreAutor(hilo)}</div>
            {(hilo.fecha_creacion || hilo.created_at) && (
              <div className="publicacion-fecha">Publicado el {fechaCorta(hilo.fecha_creacion ?? hilo.created_at)}</div>
            )}
          </div>
          {nombreCat && <BadgeForo><IconoEspecie especie={especieDeCategoria(cat)} /> {nombreCat}</BadgeForo>}
        </div>

        <h1 className="publicacion-titulo">{hilo.titulo}</h1>
        <div className="publicacion-cuerpo">{hilo.contenido}</div>

        <div className="publicacion-footer">
          <span className="small text-muted">
            <Icono nombre="chat-left-text" /> <strong className="text-verde-oscuro">{respuestas}</strong> {Number(respuestas) === 1 ? 'respuesta' : 'respuestas'}
          </span>
          {token && Number(hilo.usuario_id) !== Number(user?.id_usuario) && (
            hiloReportado ? (
              <span className="btn-reportar" aria-disabled="true" style={{ opacity: 0.6, cursor: "default" }}>
                <Icono nombre="flag-fill" /> Publicación reportada
              </span>
            ) : (
              <button type="button" className="btn-reportar" onClick={() => setReportando(true)}>
                <Icono nombre="flag" /> Reportar publicación
              </button>
            )
          )}
        </div>
      </article>

      {reportando && (
        <ReportarModal
          objeto="hilo"
          onCerrar={() => setReportando(false)}
          onReportar={async (tipo) => {
            const ok = await enviarReporte({ tipoReporteId: tipo, foroId: idHilo(hilo), idUsuario: user?.id_usuario });
            if (ok) setHiloReportado(true);
          }}
        />
      )}

      <section>
        <h2 className="comentarios-titulo">Comentarios ({comentarios.length})</h2>
        <div className="d-flex flex-column gap-3 mb-4">
          {comentarios.length > 0 ? (
            comentarios.map((c, i) => (
              <ComentarioCard key={c.id_participacion || c.id_comentario || c.id || i} comentario={c} onEliminar={eliminarComentario} />
            ))
          ) : (
            <div className="comentario-item text-center text-muted small py-4">
              Todavía no hay comentarios. ¡Sé el primero en responder!
            </div>
          )}
        </div>

        <ComentarioForm onAgregarComentario={agregarComentario} />
      </section>
    </Pagina>
  );
}

export default ForoDetalle;
