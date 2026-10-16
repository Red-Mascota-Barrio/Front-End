import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { AppNavbar } from "../../components/layout/AppNavbar";
import { Footer } from "../../components/layout/Footer";

import BadgeForo from "../../components/foro/BadgeForo";
import ComentarioCard from "../../components/foro/ComentarioCard";
import ComentarioForm from "../../components/foro/ComentarioForm";

import { foroService } from "../../services/foroService.js";


function ForoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hilo, setHilo] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDetalleHilo = async () => {
      try {
        setCargando(true);
        const respuesta = await foroService.obtenerPorId(id);
        console.log("Respuesta completa del hilo:", respuesta);
        const datosHilo = respuesta.datos || respuesta.data || respuesta;

        setHilo(datosHilo);
        setComentarios(datosHilo.comentarios_principales || datosHilo.comentariosPrincipales || datosHilo.comentarios || []);

      } catch (error) {
        console.error("Error al cargar el detalle del hilo:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDetalleHilo();
  }, [id]);

  const agregarComentario = async (nuevoComentario) => {
    try {
      const idHiloValido = hilo?.id_foro || hilo?.id || id;

      const respuesta = await foroService.crearComentario(
        idHiloValido,
        nuevoComentario,
      );
      const comentarioGuardado = respuesta.datos || respuesta.data || respuesta;

      setComentarios((prev) => [...prev, comentarioGuardado]);

      // Incrementar el contador de respuestas inmediatamente
      setHilo((prevHilo) => ({
        ...prevHilo,
        respuestas: (prevHilo?.respuestas || comentarios.length) + 1,
      }));
    } catch (error) {
      console.error("Error al publicar el comentario:", error);

      if (error.response?.status === 422) {
        alert(
          "Error de validación: " +
            JSON.stringify(error.response.data.errors || error.response.data),
        );
      } else if (error.response?.status === 401) {
        alert("Debes iniciar sesión para publicar un comentario.");
      } else {
        alert("Hubo un error al guardar tu comentario.");
      }
    }
  };

  if (cargando) {
    return (
      <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: "#f0fdfa" }}>
        <AppNavbar />
        <main className="container my-5 text-center flex-grow-1">
          <p className="text-muted">Cargando hilo...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!hilo) {
    return (
      <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: "#f0fdfa" }}>
        <AppNavbar />
        <main className="container my-5 flex-grow-1" style={{ maxWidth: "1100px" }}>
          <button 
            className="btn btn-link text-primary p-0 text-decoration-none fw-semibold mb-4" 
            onClick={() => navigate("/foro")}
          >
            ← Volver al foro
          </button>
          <div className="card border-0 shadow-sm rounded-4 text-center py-5 bg-white">
            <div className="card-body">
              <h1 className="h4 text-dark mb-0">Hilo no encontrado</h1>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const catId = hilo?.categoria_foro_id;
  const catTexto =
    hilo?.categoriaForo?.nombre_categoria || hilo?.categoria || "";
  const nombreCategoria =
    catId === 1 || catTexto.toLowerCase().includes("perro") ? "Perro" : "Gato";

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: "#f0fdfa" }}>
      <AppNavbar />

      <main className="container my-5 flex-grow-1" style={{ maxWidth: "1100px" }}>
        <button 
          className="btn btn-link text-decoration-none fw-semibold mb-4 p-0 d-inline-flex align-items-center gap-2" 
          style={{ color: "#0d9488" }}
          onClick={() => navigate("/foro")}
        >
          ← Volver al foro
        </button>

        <article className="card border-0 shadow-sm rounded-4 p-4 p-md-5 mb-5 bg-white">
          <div className="d-flex align-items-center gap-2 mb-3">
            <BadgeForo tipo="categoria">{nombreCategoria}</BadgeForo>
          </div>

          <h1 className="fw-bold text-dark mb-2" style={{ fontSize: "2rem" }}>
            {hilo.titulo}
          </h1>
          <small className="text-muted d-block mb-4">
            Publicado por {hilo.usuario?.nombre || hilo.autor || "Anónimo"}
          </small>
          <p className="text-secondary lh-lg mb-4" style={{ fontSize: "1.05rem" }}>
            {hilo.contenido}
          </p>

          <div className="border-top pt-4 mt-2">
            <div className="text-center rounded-3 p-2 border bg-light" style={{ width: "90px" }}>
              <span className="d-block h5 fw-bold mb-0 text-dark">
                {hilo.numero_comentarios ?? comentarios.length}
              </span>
              <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                Respuestas
              </small>
            </div>
          </div>
        </article>

        <section className="mb-5">
          <h2 className="h4 fw-bold text-dark mb-4">Comentarios</h2>

          <div className="d-flex flex-column gap-3 mb-4">
            {comentarios.length > 0 ? (
              comentarios.map((c) => (
                <ComentarioCard key={c.id_comentario || c.id} comentario={c} />
              ))
            ) : (
              <div className="card border-0 shadow-sm rounded-4 text-center py-4 bg-white">
                <div className="card-body text-muted">
                  Todavía no hay comentarios.
                </div>
              </div>
            )}
          </div>

          <ComentarioForm onAgregarComentario={agregarComentario} />
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default ForoDetalle;
