import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import banner from '../../assets/images/inicio/banner.png';
import { Icono } from '../common/Icono';

export const Hero = () => {
  const { token, user } = useAuth();
  const haySesion = Boolean(token && user);

  return (
    <section className="inicio-hero">
      <Container>
        <Row className="align-items-center g-5">
          <Col lg={6}>
            <div className="hero-chip"><Icono nombre="geo-alt-fill" /> La comunidad animal de tu barrio</div>
            <h1>
              Conecta, cuida
              <br />y adopta mascotas
            </h1>
            <p className="hero-texto">
              Somos la red que une personas con mascotas, cuidadores y amantes de los animales.
              Cada animal merece un hogar lleno de amor.
            </p>

            <div className="d-flex flex-wrap gap-3">
              <Button as={Link} to="/mascotas" className="btn-blanco">
                Buscar mascotas <Icono nombre="arrow-right" />
              </Button>
              {haySesion ? (
                <Button as={Link} to="/perfil" className="btn-translucido">
                  Ir a mi perfil
                </Button>
              ) : (
                <Button as={Link} to="/registro" className="btn-translucido">
                  Unirme gratis
                </Button>
              )}
            </div>
          </Col>

          <Col lg={6} className="d-none d-lg-block">
            <div className="hero-imagen">
              <img src={banner} alt="Mascotas felices en el barrio" />
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};
