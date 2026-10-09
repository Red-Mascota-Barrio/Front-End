import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { AppNavbar } from "../../components/layout/AppNavbar";
import { Footer } from "../../components/layout/Footer";

import BadgeForo from "../../components/foro/BadgeForo";
import ComentarioCard from "../../components/foro/ComentarioCard";
import ComentarioForm from "../../components/foro/ComentarioForm";

import { foroService } from "../../services/foroService.js";

import "./foro.css";

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
        const datosHilo = respuesta.datos || respuesta.data || respuesta;

        setHilo(datosHilo);
        setComentarios(datosHilo.comentarios || []);

        // Incrementar visitas si la función está definida en el servicio
        if (foroService.incrementarVisitas) {
          foroService.incrementarVisitas(id).catch(() => {});
        }
        
        setHilo((prev) => (prev ? { ...prev, visitas: (prev.visitas || 0) + 1 } : prev));
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
      // Usar la ID primaria que devuelva Laravel o el parámetro de la URL
      const idHiloValido = hilo?.id_foro || hilo?.id || id;

      const respuesta = await foroService.crearComentario(idHiloValido, nuevoComentario);
      const comentarioGuardado = respuesta.datos || respuesta.data || respuesta;

      // 1. Agregar el nuevo comentario a la lista de UI
      setComentarios((prev) => [...prev, comentarioGuardado]);

      // 2. Incrementar el contador de respuestas inmediatamente
      setHilo((prevHilo) => ({
        ...prevHilo,
        respuestas: (prevHilo?.respuestas || comentarios.length) + 1,
      }));
    } catch (error) {
      console.error("Error al publicar el comentario:", error);
      
      if (error.response?.status === 422) {
        alert("Error de validación: " + JSON.stringify(error.response.data.errors || error.response.data));
      } else if (error.response?.status === 401) {
        alert("Debes iniciar sesión para publicar un comentario.");
      } else {
        alert("Hubo un error al guardar tu comentario.");
      }
    }
  };

  if (cargando) {
    return (
      <div className="foro-pagina">
        <AppNavbar />
        <main className="foro">
          <p>Cargando hilo...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!hilo) {
    return (
      <div className="foro-pagina">
        <AppNavbar />
        <main className="foro">
          <button className="btn-volver-foro" onClick={() => navigate("/foro")}>
            ← Volver al foro
          </button>
          <div className="foro-sin-resultados">
            <h1>Hilo no encontrado</h1>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const catId = hilo?.categoria_foro_id;
  const catTexto = hilo?.categoriaForo?.nombre_categoria || hilo?.categoria || "";
  const nombreCategoria =
    catId === 1 || catTexto.toLowerCase().includes("perro") ? "Perro" : "Gato";

  return (
    <div className="foro-pagina">
      <AppNavbar />

      <main className="foro">
        <button className="btn-volver-foro" onClick={() => navigate("/foro")}>
          ← Volver al foro
        </button>

        <article className="foro-detalle">
          <div className="hilo-meta">
            <BadgeForo tipo="categoria">{nombreCategoria}</BadgeForo>
          </div>

          <h1>{hilo.titulo}</h1>
          <span className="hilo-autor">
            Publicado por {hilo.usuario?.nombre || hilo.autor || "Anónimo"}
          </span>
          <p className="foro-detalle-contenido">{hilo.contenido}</p>

          <div className="foro-detalle-estadisticas">
            <div className="estadistica">
              <strong>{hilo.respuestas ?? comentarios.length}</strong>
              <span>Respuestas</span>
            </div>
            <div className="estadistica">
              <strong>{hilo.visitas ?? 0}</strong>
              <span>Visitas</span>
            </div>
          </div>
        </article>

        <section className="comentarios-foro">
          <h2>Comentarios</h2>

          <div className="comentarios-lista">
            {comentarios.length > 0 ? (
              comentarios.map((c) => (
                <ComentarioCard key={c.id_comentario || c.id} comentario={c} />
              ))
            ) : (
              <p className="sin-comentarios">Todavía no hay comentarios.</p>
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