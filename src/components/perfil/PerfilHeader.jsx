import { Container, Row, Col, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaPaw, FaComments, FaCalendarCheck, FaHeart, FaPen, FaCheckCircle } from 'react-icons/fa';
import { AvatarPerfil } from './AvatarPerfil';
import { esVerificado } from '../../utils/perfil';

const STATS = [
  { clave: 'mascotas', etiqueta: 'Mascotas', Icono: FaPaw },
  { clave: 'publicaciones', etiqueta: 'Publicaciones', Icono: FaComments },
  { clave: 'eventos', etiqueta: 'Eventos', Icono: FaCalendarCheck },
  { clave: 'adopciones', etiqueta: 'Adopciones', Icono: FaHeart },
];

export const PerfilHeader = ({ usuario, estadisticas }) => (
  <section className="bg-white border-bottom py-5 shadow-sm">
    <Container>
      <Row className="align-items-center g-4">
        <Col md="auto" className="text-center">
          <AvatarPerfil usuario={usuario} size={130} />
        </Col>

        <Col>
          <div className="d-flex align-items-center flex-wrap gap-2 mb-2">
            <h1 className="fw-bold text-dark mb-0 fs-2">
              {usuario.nombre} {usuario.apellido}
            </h1>
            {esVerificado(usuario) ? (
              <Badge bg="success" className="d-inline-flex align-items-center gap-1 rounded-pill px-3 py-2 fw-medium" title="Cuenta verificada">
                <FaCheckCircle /> Verificado
              </Badge>
            ) : (
              <Badge bg="warning" text="dark" className="rounded-pill px-3 py-2 fw-medium">Sin verificar</Badge>
            )}
          </div>
          <p className="text-muted mb-1">{usuario.correo}</p>
          {usuario.barrio && <p className="text-muted mb-1">📍 {usuario.barrio}</p>}
          {usuario.biografia && <p className="text-secondary small mt-2 mb-3">{usuario.biografia}</p>}

          <Button as={Link} to="/perfil/editar" variant="primary" className="rounded-pill px-4 py-2 shadow-sm fw-medium d-inline-flex align-items-center gap-2 mt-1">
            <FaPen /> Editar perfil
          </Button>
        </Col>
      </Row>

      <Row className="g-3 mt-4 pt-4 border-top">
        {STATS.map(({ clave, etiqueta, Icono }) => (
          <Col xs={6} md={3} key={clave}>
            <div className="d-flex align-items-center p-3 bg-light rounded-4 border h-100 shadow-sm">
              <div className="fs-3 text-primary me-3 p-3 bg-white rounded-3 shadow-sm border d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                <Icono />
              </div>
              <div>
                <h4 className="fw-bold text-dark mb-0">{estadisticas?.[clave] ?? 0}</h4>
                <span className="text-muted small fw-medium">{etiqueta}</span>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </Container>
  </section>
);