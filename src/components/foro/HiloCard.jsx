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
    <div
      className="card shadow-sm mb-3 border-0 cursor-pointer transition-hover"
      style={{ cursor: "pointer" }}
      onClick={() => navigate(`/foro/${hilo.id_foro || hilo.id}`)}
    >
      <div className="card-body d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 p-4">
        <div className="flex-grow-1">
          <div className="d-flex align-items-center gap-2 mb-2">
            <BadgeForo tipo="categoria">{nombreCategoria}</BadgeForo>
            {hilo.destacado && <BadgeForo tipo="destacado">Destacado</BadgeForo>}
          </div>

          <h2 className="h5 fw-bold text-dark mb-2">{hilo.titulo}</h2>
          <p className="text-secondary mb-2 text-truncate" style={{ maxWidth: "700px" }}>
            {hilo.contenido}
          </p>

          <small className="text-muted">
            Publicado por {hilo.usuario?.nombre || hilo.autor || "Anónimo"}
          </small>
        </div>

        <div className="d-flex align-items-center justify-content-md-end text-center px-3 py-2 bg-light rounded">
          <div>
            <span className="d-block h5 fw-bold mb-0 text-dark">
              {hilo.numero_comentarios ?? 0}
            </span>
            <small className="text-muted" style={{ fontSize: "0.75rem" }}>
              Respuestas
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HiloCard;
