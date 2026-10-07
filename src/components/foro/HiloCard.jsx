import { useNavigate } from "react-router-dom";
import BadgeForo from "./BadgeForo";

function HiloCard({ hilo }) {
  const navigate = useNavigate();

  return (
    <article className="hilo-card" onClick={() => navigate(`/foro/${hilo.id}`)}>
      <div className="hilo-card-contenido">
        <div className="hilo-meta">
          <BadgeForo tipo="categoria">{hilo.categoria}</BadgeForo>

          {hilo.destacado && <BadgeForo tipo="destacado">Destacado</BadgeForo>}
        </div>

        <h2>{hilo.titulo}</h2>

        <p>{hilo.contenido}</p>

        <span className="hilo-autor">Publicado por {hilo.autor}</span>
      </div>

      <div className="hilo-estadisticas">
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
  );
}

export default HiloCard;
