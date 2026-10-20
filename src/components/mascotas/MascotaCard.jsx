import { urlFoto, fotoDeMascota, SIN_FOTO } from '../../services/mascotasService';
import { especieDeMascota, razaDeMascota, estadoMascota } from '../../utils/admin';
import { Icono, IconoEspecie } from '../common/Icono';
import { capitalizar, textoEdad, textoTamano, claseFoto } from '../../utils/mascotas';

const CLASE_BADGE = {
  success: 'badge-verde',
  secondary: 'badge-gris',
  danger: 'badge-rojo',
  warning: 'badge-naranja',
  primary: 'badge-azul',
};

// Tarjeta de mascota con el diseño del mockup (busqueda.html)
export default function MascotaCard({ mascota, onVerPerfil }) {
  const especie = especieDeMascota(mascota);
  const raza = razaDeMascota(mascota) || mascota.raza?.nombre;
  const estado = estadoMascota(mascota);
  // GET /mascotas no carga 'adopciones': sin ese dato no se inventa un estado
  const mostrarEstado = Array.isArray(mascota.adopciones) || Boolean(mascota.estado_adopcion);
  const edad = textoEdad(mascota);
  const src = urlFoto(fotoDeMascota(mascota));

  return (
    <button type="button" className="mascota-card" onClick={() => onVerPerfil?.(mascota)}>
      <div className="mascota-card-img">
        <img
          src={src}
          className={claseFoto(src, SIN_FOTO)}
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = SIN_FOTO; e.currentTarget.classList.add('sin-foto'); }}
          alt={mascota.nombre}
          loading="lazy"
        />
        {mostrarEstado && (
          <span className={`badge mascota-card-badge ${CLASE_BADGE[estado.clase] ?? 'badge-verde'}`}>
            {estado.texto}
          </span>
        )}
      </div>

      <div className="mascota-card-cuerpo">
        <h3>{mascota.nombre}</h3>
        <p>
          {[raza, capitalizar(mascota.genero)].filter(Boolean).join(' · ') || 'Sin datos de raza'}
        </p>
        <div className="mascota-card-meta">
          {especie && <span className="mascota-meta-chip"><IconoEspecie especie={especie} /> {especie}</span>}
          {edad && <span className="mascota-meta-chip"><Icono nombre="calendar3" /> {edad}</span>}
          {mascota.tamano && <span className="mascota-meta-chip"><Icono nombre="rulers" /> {textoTamano(mascota.tamano)}</span>}
        </div>
      </div>

      <div className="mascota-card-pie">
        <span>{Number(mascota.vacunas_al_dia) ? <><Icono nombre="shield-check" /> Vacunas al día</> : ' '}</span>
        <span className="mascota-card-ver-mas">Ver más <Icono nombre="arrow-right" /></span>
      </div>
    </button>
  );
}
