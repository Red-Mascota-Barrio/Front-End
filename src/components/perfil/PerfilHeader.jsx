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
  <section className="perfil-hero">
    <Container>
      <Row className="align-items-center g-4">
        <Col md="auto" className="text-center">
          <AvatarPerfil usuario={usuario} size={130} />
        </Col>

        <Col>
          <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
            <h1 className="perfil-nombre mb-0">
              {usuario.nombre} {usuario.apellido}
            </h1>
            {esVerificado(usuario) ? (
              <Badge pill className="perfil-insignia" title="Cuenta verificada">
                <FaCheckCircle className="me-1" /> Verificado
              </Badge>
            ) : (
              <Badge pill bg="warning" text="dark">Sin verificar</Badge>
            )}
          </div>
          <p className="mb-1 opacity-75">{usuario.correo}</p>
          {usuario.barrio && <p className="mb-1 opacity-75">📍 {usuario.barrio}</p>}
          {usuario.biografia && <p className="mb-2 perfil-bio">{usuario.biografia}</p>}

          <Button as={Link} to="/perfil/editar" className="btn-cta mt-2">
            <FaPen className="me-2" /> Editar perfil
          </Button>
        </Col>
      </Row>

      <Row className="g-3 mt-4">
        {STATS.map(({ clave, etiqueta, Icono }) => (
          <Col xs={6} md={3} key={clave}>
            <div className="perfil-stat">
              <Icono />
              <strong>{estadisticas?.[clave] ?? 0}</strong>
              <span>{etiqueta}</span>
            </div>
          </Col>
        ))}
      </Row>
    </Container>
  </section>
);
