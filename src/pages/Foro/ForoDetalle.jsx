import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { AppNavbar } from "../../components/layout/AppNavbar";
import { Footer } from "../../components/layout/Footer";

import BadgeForo from "../../components/foro/BadgeForo";
import ComentarioCard from "../../components/foro/ComentarioCard";
import ComentarioForm from "../../components/foro/ComentarioForm";

import "./foro.css";

const comentariosIniciales = {
  2: [
    {
      id: 1,
      autor: "Usuario 4",
      contenido:
        "Me parece una excelente idea para comenzar.",
      fecha: "Hoy",
    },
    {
      id: 2,
      autor: "Usuario 5",
      contenido:
        "Yo también estoy trabajando en algo parecido.",
      fecha: "Hoy",
    },
  ],
};

function ForoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const numeroId = Number(id);

  const hilosGuardados = JSON.parse(
    localStorage.getItem("hilosForo") || "[]"
  );

  const hiloEncontrado = hilosGuardados.find(
    (hilo) => hilo.id === numeroId
  );

  const [hilo, setHilo] = useState(() => {
    if (!hiloEncontrado) {
      return null;
    }

    const hiloActualizado = {
      ...hiloEncontrado,
      visitas: hiloEncontrado.visitas + 1,
    };

    const hilosActualizados = hilosGuardados.map(
      (hiloActual) =>
        hiloActual.id === numeroId
          ? hiloActualizado
          : hiloActual
    );

    localStorage.setItem(
      "hilosForo",
      JSON.stringify(hilosActualizados)
    );

    return hiloActualizado;
  });

  const [comentarios, setComentarios] = useState(() => {
    const comentariosGuardados = localStorage.getItem(
      `comentariosForo_${id}`
    );

    if (comentariosGuardados) {
      return JSON.parse(comentariosGuardados);
    }

    return comentariosIniciales[id] || [];
  });

  if (!hilo) {
    return (
      <div className="foro-pagina">

        <AppNavbar />

        <main className="foro">

          <button
            className="btn-volver-foro"
            onClick={() => navigate("/foro")}
          >
            ← Volver al foro
          </button>

          <div className="foro-sin-resultados">
            <h1>Hilo no encontrado</h1>

            <p>
              El hilo que estás buscando no existe.
            </p>
          </div>

        </main>

        <Footer />

      </div>
    );
  }

  const agregarComentario = (nuevoComentario) => {
    setComentarios((comentariosActuales) => {
      const nuevosComentarios = [
        ...comentariosActuales,
        nuevoComentario,
      ];

      localStorage.setItem(
        `comentariosForo_${id}`,
        JSON.stringify(nuevosComentarios)
      );

      return nuevosComentarios;
    });

    const hilosActuales = JSON.parse(
      localStorage.getItem("hilosForo") || "[]"
    );

    const hilosActualizados = hilosActuales.map(
      (hiloActual) => {
        if (hiloActual.id === numeroId) {
          return {
            ...hiloActual,
            respuestas: hiloActual.respuestas + 1,
          };
        }

        return hiloActual;
      }
    );

    localStorage.setItem(
      "hilosForo",
      JSON.stringify(hilosActualizados)
    );

    const hiloActualizado = hilosActualizados.find(
      (hiloActual) => hiloActual.id === numeroId
    );

    setHilo(hiloActualizado);
  };

  return (
    <div className="foro-pagina">

      <AppNavbar />

      <main className="foro">

        <button
          className="btn-volver-foro"
          onClick={() => navigate("/foro")}
        >
          ← Volver al foro
        </button>

        <article className="foro-detalle">

          <div className="hilo-meta">

            <BadgeForo tipo="categoria">
              {hilo.categoria}
            </BadgeForo>

            {hilo.destacado && (
              <BadgeForo tipo="destacado">
                Destacado
              </BadgeForo>
            )}

          </div>

          <h1>{hilo.titulo}</h1>

          <span className="hilo-autor">
            Publicado por {hilo.autor}
          </span>

          <p className="foro-detalle-contenido">
            {hilo.contenido}
          </p>

          <div className="foro-detalle-estadisticas">

            <div className="estadistica">
              <strong>{hilo.respuestas}</strong>
              <span>Respuestas</span>
            </div>

            <div className="estadistica">
              <strong>{hilo.visitas}</strong>
              <span>Visitas</span>
            </div>

          </div>

        </article>

        <section className="comentarios-foro">

          <h2>Comentarios</h2>

          <div className="comentarios-lista">

            {comentarios.length > 0 ? (
              comentarios.map((comentario) => (
                <ComentarioCard
                  key={comentario.id}
                  comentario={comentario}
                />
              ))
            ) : (
              <p className="sin-comentarios">
                Todavía no hay comentarios.
                Sé el primero en comentar.
              </p>
            )}

          </div>

          <ComentarioForm
            onAgregarComentario={agregarComentario}
          />

        </section>

      </main>

      <Footer />

    </div>
  );
}

export default ForoDetalle;
