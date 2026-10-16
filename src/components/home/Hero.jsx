import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import banner from '../../assets/images/inicio/banner.png';
import flecha from '../../assets/images/inicio/flecha-abajo.png';

export const Hero = () => {
  const { token, user } = useAuth();
  const haySesion = Boolean(token && user);

  const bajar = (e) => {
    e.preventDefault();
    document.getElementById('estadisticas')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <section className="bg-light py-5 position-relative">
        <Container className="py-5">
          <Row className="align-items-center g-5">
            <Col lg={7}>
              <h1 className="display-4 fw-bold text-dark mb-3">
                ¡Bienvenidos a tu <span className="text-primary">red de mascotas</span> confiable! 🐾
              </h1>
              <p className="fs-4 text-secondary fst-italic mb-3">
                “Conecta con mascotas, cuidadores y amantes de los animales”
              </p>
              <p className="lead text-muted mb-4">
                Conecta, Cuida y Adopta. Somos la comunidad que hace posibles las conexiones
                peludas que cambian vidas. Facilitamos la adopción responsable de mascotas,
                porque cada animal merece un hogar. ¡Encontrar a tu alma gemela de cuatro
                patas es posible aquí!
              </p>

              <div className="d-flex flex-wrap gap-3 mt-4">
                {haySesion ? (
                  <>
                    <Button as={Link} to="/mascotas" size="lg" className="btn-primary rounded-pill px-4 shadow-sm">
                      Adoptar
                    </Button>
                    <Button as={Link} to="/perfil" size="lg" variant="outline-primary" className="rounded-pill px-4">
                      Ir a mi panel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button as={Link} to="/registro" size="lg" className="btn-primary rounded-pill px-4 shadow-sm">
                      Crear cuenta
                    </Button>
                    <Button as={Link} to="/login" size="lg" variant="outline-primary" className="rounded-pill px-4">
                      Iniciar sesión
                    </Button>
                  </>
                )}
              </div>
            </Col>

            <Col lg={5} className="text-center">
              <img 
                src={banner} 
                alt="Perro y gato juntos" 
                className="img-fluid rounded-4 shadow-lg"
              />
            </Col>
          </Row>
        </Container>

        <div className="position-absolute bottom-0 start-0 w-100 text-white" aria-hidden="true" style={{ lineHeight: 0 }}>
          <svg viewBox="0 0 1440 90" preserveAspectRatio="none" className="w-100" style={{ height: '50px' }}>
            <path
              fill="currentColor"
              d="M0,48L80,42.7C160,37,320,27,480,32C640,37,800,59,960,64C1120,69,1280,59,1360,53.3L1440,48L1440,90L0,90Z"
            />
          </svg>
        </div>
      </section>

      <div className="text-center bg-white py-4">
        <a href="#estadisticas" onClick={bajar} aria-label="Bajar" className="d-inline-block">
          <img src={flecha} alt="Flecha hacia abajo" width="40" className="opacity-75" />
        </a>
      </div>
    </>
  );
};