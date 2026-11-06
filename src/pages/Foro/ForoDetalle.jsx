import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Button, Container, Spinner } from "react-bootstrap";

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
  const [params] = useSearchParams();
  const comentarioUrl = params.get("comentario"); // viene de una notificación
  const { user, token } = useAuth();

  const [hilo, setHilo] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [reportando, setReportando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [recarga, setRecarga] = useState(0);
  const [hiloReportado, setHiloReportado] = useState(false);

  const contarComentarios = (lista) => lista.reduce((total, comentario) => total + 1 + contarComentarios(comentario.respuestas || []), 0);

  const agregarEnHilo = (lista, padreId, nuevo) => lista.map((comentario) => {
    const comentarioId = comentario.id_participacion ?? comentario.id;
    if (Number(comentarioId) === Number(padreId)) {
      return { ...comentario, respuestas: [...(comentario.respuestas || []), nuevo] };
    }
    if (comentario.respuestas?.length) {
      return { ...comentario, respuestas: agregarEnHilo(comentario.respuestas, padreId, nuevo) };
    }
    return comentario;
  });

  const eliminarDelHilo = (lista, comentarioId) => lista
    .filter((comentario) => Number(comentario.id_participacion ?? comentario.id) !== Number(comentarioId))
    .map((comentario) => ({
      ...comentario,
      respuestas: eliminarDelHilo(comentario.respuestas || [], comentarioId),
    }));

  const actualizarRecomendacion = (lista, comentarioId, datos) => lista.map((comentario) => {
    if (Number(comentario.id_participacion ?? comentario.id) === Number(comentarioId)) {
      return { ...comentario, ...datos };
    }
    return comentario.respuestas?.length
      ? { ...comentario, respuestas: actualizarRecomendacion(comentario.respuestas, comentarioId, datos) }
      : comentario;
  });

  useEffect(() => {
    let activo = true;
    setCargando(true);
    setErrorCarga("");
    setHilo(null);
    setComentarios([]);
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
      .catch((error) => {
        if (!activo) return;
        setErrorCarga(error.response?.data?.mensaje || "No pudimos cargar esta publicación. Comprueba tu conexión e inténtalo de nuevo.");
      })
      .finally(() => activo && setCargando(false));

    return () => { activo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, recarga]);

  // Notificación de un comentario: baja hasta él y lo resalta unos segundos
  useEffect(() => {
    if (cargando || !comentarioUrl) return undefined;
    const el = document.getElementById(`comentario-${comentarioUrl}`);
    if (!el) return undefined;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("resaltado-notificacion");
    const t = setTimeout(() => el.classList.remove("resaltado-notificacion"), 3500);
    return () => { clearTimeout(t); el.classList.remove("resaltado-notificacion"); };
  }, [cargando, comentarioUrl, comentarios]);

  const agregarComentario = async (nuevoComentario, comentarioPadreId = null) => {
    try {
      const respuesta = await foroService.crearComentario(idHilo(hilo) || id, nuevoComentario, comentarioPadreId);
      const guardado = respuesta.datos || respuesta.data || respuesta;
      const nuevo = { ...guardado, usuario: guardado.usuario ?? user, respuestas: [] };
      setComentarios((prev) => comentarioPadreId
        ? agregarEnHilo(prev, comentarioPadreId, nuevo)
        : [...prev, nuevo]);
      setHilo((prev) => ({ ...prev, numero_comentarios: (Number(prev?.numero_comentarios) || contarComentarios(comentarios)) + 1 }));
      return true;
    } catch (error) {
      console.error("Error al publicar el comentario:", error);
      const data = error.response?.data;
      if (error.response?.status === 422) {
        notificarError("Revisa tu comentario", Object.values(data?.errors ?? data?.errores ?? data?.error ?? {}).flat().join(" ") || data?.mensaje);
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
      const eliminados = (function contarSubarbol(comentario) {
        return 1 + (comentario.respuestas || []).reduce((total, respuesta) => total + contarSubarbol(respuesta), 0);
      })(comentario);
      setComentarios((prev) => eliminarDelHilo(prev, idComentario));
      setHilo((prev) => ({ ...prev, numero_comentarios: Math.max(0, (Number(prev?.numero_comentarios) || contarComentarios(comentarios)) - eliminados) }));
      notificarExito("Comentario eliminado");
    } catch (error) {
      const data = error.response?.data;
      notificarError("No se pudo eliminar", data?.mensaje || data?.message || "Intenta de nuevo más tarde.");
    }
  };

  const recomendarComentario = async (comentarioId, yaRecomendado) => {
    try {
      const respuesta = yaRecomendado
        ? await foroService.quitarRecomendacion(comentarioId)
        : await foroService.recomendarComentario(comentarioId);
      const datos = respuesta.datos || respuesta.data || {};
      setComentarios((prev) => actualizarRecomendacion(prev, comentarioId, datos));
      return true;
    } catch (error) {
      const mensaje = error.response?.data?.mensaje || "No pudimos guardar tu recomendación. Inténtalo de nuevo.";
      notificarError("No se pudo recomendar", mensaje);
      return false;
    }
  };

  if (cargando) {
    return (
      <Pagina>
        <div className="text-center py-5">
          <Spinner animation="border" role="status" />
          <p className="mt-3 text-muted">Cargando foro…</p>
        </div>
      </Pagina>
    );
  }

  if (!hilo) {
    return (
      <Pagina>
        <div className="estado-vacio publicacion-principal">
          <div className="estado-vacio-icono"><Icono nombre={errorCarga ? "exclamation-triangle" : "search"} /></div>
          <h3>{errorCarga ? "No se pudo cargar la publicación" : "Foro no encontrado"}</h3>
          <p>{errorCarga || "Puede que haya sido eliminado o que el enlace sea incorrecto."}</p>
          {errorCarga && <Button variant="outline-success" className="me-2" onClick={() => setRecarga((valor) => valor + 1)}>Reintentar</Button>}
          <Link to="/foro" className="btn btn-primary">Ver todos los foros</Link>
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
          objeto="foro"
          onCerrar={() => setReportando(false)}
          onReportar={async (tipo) => {
            const ok = await enviarReporte({ tipoReporteId: tipo, foroId: idHilo(hilo), idUsuario: user?.id_usuario });
            if (ok) setHiloReportado(true);
          }}
        />
      )}

      <section>
        <h2 className="comentarios-titulo">Comentarios ({contarComentarios(comentarios)})</h2>
        <div className="d-flex flex-column gap-3 mb-4">
          {comentarios.length > 0 ? (
            comentarios.map((c, i) => (
              <ComentarioCard
                key={c.id_participacion || c.id_comentario || c.id || i}
                comentario={c}
                onEliminar={eliminarComentario}
                onRecomendar={recomendarComentario}
                onAgregarComentario={agregarComentario}
              />
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
