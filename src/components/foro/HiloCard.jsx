import { useNavigate } from "react-router-dom";
import BadgeForo from "./BadgeForo";

function HiloCard({ hilo }) {
  const navigate = useNavigate();

  const catId = hilo?.categoria_foro_id;
  const catTexto =
    hilo?.categoriaForo?.nombre_categoria || hilo?.categoria || "";

  const nombreCategoria =
    catId === 1 || catTexto.toLowerCase().includes("perro") ? "Perro" : "Gato";

  return (
    <article
      className="hilo-card"
      onClick={() => navigate(`/foro/${hilo.id_foro || hilo.id}`)}
    >
      <div className="hilo-card-contenido">
        <div className="hilo-meta">
          <BadgeForo tipo="categoria">{nombreCategoria}</BadgeForo>

          {hilo.destacado && <BadgeForo tipo="destacado">Destacado</BadgeForo>}
        </div>

        <h2>{hilo.titulo}</h2>

        <p>{hilo.contenido}</p>

        <span className="hilo-autor">
          Publicado por {hilo.usuario?.nombre || hilo.autor || "Anónimo"}
        </span>
      </div>

      <div className="hilo-estadisticas">
        <div className="estadistica">
          <strong>{hilo.numero_comentarios ?? 0}</strong>
          <span>Respuestas</span>
        </div>
      </div>
    </article>
  );
}

export default HiloCard;
