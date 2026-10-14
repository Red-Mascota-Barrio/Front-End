import { urlFoto } from '../../services/mascotasService';

export default function MascotaCard({ mascota, onVerPerfil }) {
  return (
    <div className="card h-100 shadow-sm border-0">
      <img
        src={urlFoto(mascota.foto)}
        className="card-img-top"
        alt={mascota.nombre}
        style={{ height: '200px', objectFit: 'cover' }}
      />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title text-primary fw-bold mb-1">{mascota.nombre}</h5>
        <p className="card-text text-muted small mb-2">
          {mascota.especie} {mascota.raza ? `• ${mascota.raza}` : ''}
        </p>
        <div className="mt-auto pt-2">
          <button
            className="btn btn-outline-primary btn-sm w-100"
            onClick={() => onVerPerfil(mascota)}
          >
            Ver Perfil
          </button>
        </div>
      </div>
    </div>
  );
}



