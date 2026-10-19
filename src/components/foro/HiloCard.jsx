import { Link } from 'react-router-dom';
import BadgeForo from './BadgeForo';
import { Icono, IconoEspecie } from '../common/Icono';
import { haceCuanto } from '../../utils/admin';
import {
  idHilo, categoriaDeHilo, nombreCategoria, especieDeCategoria,
  nombreAutor, inicialesAutor, colorAvatar,
} from '../../utils/foro';

function HiloCard({ hilo, categorias = [] }) {
  const cat = categoriaDeHilo(hilo, categorias);
  const nombreCat = nombreCategoria(cat);
  const respuestas = hilo.numero_comentarios ?? hilo.respuestas ?? 0;

  return (
    <Link to={`/foro/${idHilo(hilo)}`} className={`foro-hilo ${hilo.destacado ? 'destacado' : ''}`}>
      <div className={`avatar-gradiente ${colorAvatar(hilo)}`} aria-hidden="true">
        {inicialesAutor(hilo)}
      </div>

      <div className="foro-hilo-cuerpo">
        <div className="foro-hilo-titulo">{hilo.titulo}</div>
        <div className="foro-hilo-preview">{hilo.contenido}</div>
        <div className="foro-hilo-meta">
          <span><Icono nombre="person" /> {nombreAutor(hilo)}</span>
          {(hilo.fecha_creacion || hilo.created_at) && (
            <span><Icono nombre="clock" /> {haceCuanto(hilo.fecha_creacion ?? hilo.created_at)}</span>
          )}
          {nombreCat && (
            <BadgeForo>
              <IconoEspecie especie={especieDeCategoria(cat)} /> {nombreCat}
            </BadgeForo>
          )}
          {hilo.destacado && <BadgeForo tipo="destacado"><Icono nombre="pin-angle" /> Destacado</BadgeForo>}
        </div>
      </div>

      <div className="foro-hilo-stats">
        <div className="foro-stat-num">{respuestas}</div>
        <div className="foro-stat-lbl">{Number(respuestas) === 1 ? 'respuesta' : 'respuestas'}</div>
      </div>
    </Link>
  );
}

export default HiloCard;
