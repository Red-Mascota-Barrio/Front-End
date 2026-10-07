import { Row, Col, Badge } from 'react-bootstrap';
import { FaPaw } from 'react-icons/fa';
import { perfilService } from '../../services/perfilService';
import { ListaPestana } from './ListaPestana';

const imagenMascota = (m) => m.imagen_principal ?? m.imagenes?.[0]?.url ?? m.imagenes?.[0]?.ruta ?? null;

export const TabMisMascotas = () => (
  <ListaPestana cargar={perfilService.misMascotas} vacio="Aún no has registrado mascotas 🐶🐱">
    {(mascotas) => (
      <Row className="g-4">
        {mascotas.map((m) => (
          <Col sm={6} lg={4} key={m.id}>
            <div className="inicio-card perfil-item">
              <div className="perfil-mascota-img">
                {imagenMascota(m) ? <img src={imagenMascota(m)} alt={m.nombre} /> : <FaPaw size={36} />}
              </div>
              <h5 className="mt-3 mb-1">{m.nombre}</h5>
              <small className="text-muted d-block mb-2">
                {m.raza?.nombre ?? 'Raza no registrada'}
              </small>
              {m.estado_adopcion && <Badge className="perfil-insignia">{m.estado_adopcion}</Badge>}
            </div>
          </Col>
        ))}
      </Row>
    )}
  </ListaPestana>
);
