import { Container, Row, Col } from 'react-bootstrap';
import { FaSearch, FaComments, FaDog, FaCalendarAlt, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../../assets/home.css';

// Cada tarjeta es característica y acceso rápido a la vez.
// Si la ruta es privada, ProtectedRoute manda al login automáticamente.
const FEATURES = [
  { titulo: 'Adopta', texto: 'Busca mascotas por especie, raza y estado de adopción.', to: '/mascotas', Icono: FaSearch },
  { titulo: 'Foros', texto: 'Comparte consejos y dudas con la comunidad.', to: '/foros', Icono: FaComments },
  { titulo: 'Mis mascotas', texto: 'Registra y administra a tus peludos.', to: '/mis-mascotas', Icono: FaDog },
  { titulo: 'Eventos', texto: 'Inscríbete a jornadas de adopción y vacunación.', to: '/eventos', Icono: FaCalendarAlt },
];

export const FeaturesSection = () => (
  <section className="inicio-seccion">
    <Container>
      <h2 className="inicio-titulo">Accesos rápidos</h2>
      <Row className="g-4">
        {FEATURES.map(({ titulo, texto, to, Icono }) => (
          <Col sm={6} lg={3} key={titulo}>
            <Link to={to} className="inicio-card">
              <div className="inicio-icono-circulo"><Icono /></div>
              <h5>{titulo}</h5>
              <p>{texto}</p>
              <span className="inicio-ir">Ir ahora <FaArrowRight size={12} /></span>
            </Link>
          </Col>
        ))}
      </Row>
    </Container>
  </section>
);
