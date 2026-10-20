import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import banner from '../../assets/inicio/banner.png';
import flecha from '../../assets/inicio/flecha-abajo.png';
import '../../assets/home.css';

export const Hero = () => {
  const { token, user } = useAuth();
  const haySesion = Boolean(token && user);

  const bajar = (e) => {
    e.preventDefault();
    document.getElementById('estadisticas')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <section className="inicio-hero">
        <Container>
          <Row className="align-items-center g-5">
            <Col lg={7}>
              <h1>
                ¡Bienvenidos a tu <span>red de mascotas</span> confiable! 🐾
              </h1>
              <p className="inicio-frase">
                “Conecta con mascotas, cuidadores y amantes de los animales”
              </p>
              <p className="inicio-descripcion">
                Conecta, Cuida y Adopta. Somos la comunidad que hace posibles las conexiones
                peludas que cambian vidas. Facilitamos la adopción responsable de mascotas,
                porque cada animal merece un hogar. ¡Encontrar a tu alma gemela de cuatro
                patas es posible aquí!
              </p>

              <div className="d-flex flex-wrap gap-3 mt-4 inicio-ctas">
                {haySesion ? (
                  <>
                    <Button as={Link} to="/mascotas" size="lg" className="btn-cta">Adoptar</Button>
                    <Button as={Link} to="/dashboard" size="lg" className="btn-cta-outline">Ir a mi panel</Button>
                  </>
                ) : (
                  <>
                    <Button as={Link} to="/registro" size="lg" className="btn-cta">Crear cuenta</Button>
                    <Button as={Link} to="/login" size="lg" className="btn-cta-outline">Iniciar sesión</Button>
                  </>
                )}
              </div>
            </Col>

            <Col lg={5}>
              <div className="inicio-banner-img">
                <img src={banner} alt="Perro y gato juntos" />
              </div>
            </Col>
          </Row>
        </Container>

        <div className="inicio-onda" aria-hidden="true">
          <svg viewBox="0 0 1440 90" preserveAspectRatio="none">
            <path
              fill="currentColor"
              d="M0,48L80,42.7C160,37,320,27,480,32C640,37,800,59,960,64C1120,69,1280,59,1360,53.3L1440,48L1440,90L0,90Z"
            />
          </svg>
        </div>
      </section>

      <div className="inicio-flecha">
        <a href="#estadisticas" onClick={bajar} aria-label="Bajar">
          <img src={flecha} alt="Flecha hacia abajo" />
        </a>
      </div>
    </>
  );
};
