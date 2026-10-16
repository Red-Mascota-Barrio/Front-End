import { urlFoto } from '../../services/mascotasService';

export default function PerfilMascotaModal({ mascota, onClose }) {
  if (!mascota) return null;

  return (
    <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Perfil de {mascota.nombre}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="row g-4 align-items-center">
              <div className="col-md-5 text-center">
                <img
                  src={urlFoto(mascota.foto)}
                  alt={mascota.nombre}
                  className="img-fluid rounded shadow-sm"
                  style={{ maxHeight: '250px', objectFit: 'cover', width: '100%' }}
                />
              </div>
              <div className="col-md-7">
                <h3 className="text-primary fw-bold mb-1">{mascota.nombre}</h3>
                <p className="text-muted mb-3">{mascota.especie} {mascota.raza ? `- ${mascota.raza}` : ''}</p>

                <div className="d-flex flex-wrap gap-2 mb-3">
                  {mascota.edad && <span className="badge bg-info text-dark">{mascota.edad}</span>}
                  {mascota.genero && <span className="badge bg-secondary">{mascota.genero}</span>}
                  {mascota.esterilizado && <span className="badge bg-success">Esterilizado/a</span>}
                  {mascota.vacunasAlDia && <span className="badge bg-primary">Vacunas al día</span>}
                </div>

                <div className="mb-3">
                  <h6>Descripción:</h6>
                  <p className="small text-secondary">{mascota.descripcion || 'Sin información adicional registrada.'}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-outline-secondary" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

