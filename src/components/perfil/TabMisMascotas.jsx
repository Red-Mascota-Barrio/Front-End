import { Row, Col, Badge } from 'react-bootstrap';
import { FaPaw } from 'react-icons/fa';
import { perfilService } from '../../services/perfilService';
import { ListaPestana } from './ListaPestana';
import { urlFoto, fotoDeMascota } from '../../services/mascotasService';

// La API devuelve la ruta en "foto" (o en imagenes[].url_imagen); hay que convertirla en URL de /storage
const imagenMascota = (m) => {
  const ruta = m.imagen_principal ?? fotoDeMascota(m);
  return ruta ? urlFoto(ruta) : null;
};

export const TabMisMascotas = () => (
  <ListaPestana cargar={perfilService.misMascotas} vacio="Aún no has registrado mascotas 🐶🐱">
    {(mascotas) => (
      <Row className="g-4">
        {mascotas.map((m) => {
          const img = imagenMascota(m);
          return (
            <Col sm={6} lg={4} key={m.id}>
              <div className="card h-100 shadow-sm border-0 rounded-4 text-center p-3 bg-white">
                <div 
                  className="mx-auto rounded-circle overflow-hidden d-flex align-items-center justify-content-center bg-light text-secondary border mb-3"
                  style={{ width: '100px', height: '100px' }}
                >
                  {img ? (
                    <img src={img} alt={m.nombre} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                  ) : (
                    <FaPaw size={36} className="text-muted opacity-50" />
                  )}
                </div>
                <div className="card-body p-0 d-flex flex-column align-items-center">
                  <h5 className="fw-bold text-dark mb-1">{m.nombre}</h5>
                  <small className="text-muted d-block mb-3">
                    {m.raza?.nombre ?? 'Raza no registrada'}
                  </small>
                  {m.estado_adopcion && (
                    <Badge bg="primary" className="rounded-pill px-3 py-2 fw-medium mt-auto">
                      {m.estado_adopcion}
                    </Badge>
                  )}
                </div>
              </div>
            </Col>
          );
        })}
      </Row>
    )}
  </ListaPestana>
);