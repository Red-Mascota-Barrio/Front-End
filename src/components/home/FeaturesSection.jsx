import { Container, Row, Col } from 'react-bootstrap';
import { FaSearch, FaComments, FaDog, FaCalendarAlt, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const FEATURES = [
  { titulo: 'Adopta', texto: 'Busca mascotas por especie, raza y estado de adopción.', to: '/mascotas', Icono: FaSearch },
  { titulo: 'Foros', texto: 'Comparte consejos y dudas con la comunidad.', to: '/foros', Icono: FaComments },
  { titulo: 'Mis mascotas', texto: 'Registra y administra a tus peludos.', to: '/mis-mascotas?registrar=1', Icono: FaDog },
  { titulo: 'Eventos', texto: 'Inscríbete a jornadas de adopción y vacunación.', to: '/eventos', Icono: FaCalendarAlt },
];

export const FeaturesSection = () => (
  <section className="py-5 bg-white">
    <Container className="py-4">
      <h2 className="text-center fw-bold text-dark mb-5">Accesos rápidos</h2>
      <Row className="g-4">
        {FEATURES.map(({ titulo, texto, to, Icono }) => (
          <Col sm={6} lg={3} key={titulo}>
            <Link 
              to={to} 
              className="d-flex flex-column align-items-center text-center p-4 bg-white rounded-4 shadow-sm border text-decoration-none h-100"
              style={{ transition: 'transform 0.2s ease-in-out', cursor: 'pointer' }}
              onMouseEnter={(e) => e.currentTarget.classList.add('shadow')}
              onMouseLeave={(e) => e.currentTarget.classList.remove('shadow')}
            >
              <div 
                className="d-flex justify-content-center align-items-center rounded-circle bg-primary bg-opacity-10 text-primary mb-3"
                style={{ width: '70px', height: '70px', fontSize: '1.75rem' }}
              >
                <Icono />
              </div>
              <h5 className="fw-bold text-dark mb-2">{titulo}</h5>
              <p className="text-muted mb-4">{texto}</p>
              <span className="text-primary fw-semibold mt-auto d-flex align-items-center gap-2">
                Ir ahora <FaArrowRight size={12} />
              </span>
            </Link>
          </Col>
        ))}
      </Row>
    </Container>
  </section>
);