import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AppNavbar } from '../../components/layout/AppNavbar';
import { Hero } from '../../components/home/Hero';
import { StatsSection } from '../../components/home/StatsSection';
import { ConsejosCarousel } from '../../components/home/ConsejosCarousel';
import { FeaturesSection } from '../../components/home/FeaturesSection';
import { Footer } from '../../components/layout/Footer';
import { useAuth } from '../../context/AuthContext';
import { Icono } from '../../components/common/Icono';
import '../../styles/home.css';

const SeccionCTA = () => {
  const { token, user } = useAuth();
  const haySesion = Boolean(token && user);

  return (
    <section className="seccion-cta">
      <Container>
        <div className="cta-caja">
          <div className="cta-icono"><Icono nombre="house-heart" /></div>
          <h2 className="cta-titulo">¿Tienes una mascota que necesita hogar?</h2>
          <p className="cta-texto">
            Regístrala en nuestra plataforma y conecta con familias responsables que quieren
            adoptarla en tu barrio.
          </p>
          <div className="d-flex justify-content-center flex-wrap gap-3">
            <Button as={Link} to={haySesion ? '/mis-mascotas?registrar=1' : '/registro'} size="lg">
              Publicar mascota
            </Button>
            <Button as={Link} to="/mascotas" variant="outline-primary" size="lg">
              Explorar mascotas
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
};

export const Inicio = () => (
  <div className="d-flex flex-column min-vh-100">
    <AppNavbar />
    <main className="flex-grow-1">
      <Hero />
      <StatsSection />
      <FeaturesSection />
      <ConsejosCarousel />
      <SeccionCTA />
    </main>
    <Footer />
  </div>
);
