import { Container, Row, Col } from 'react-bootstrap';
import consejo1 from '../../assets/images/inicio/consejo-1.jpeg';
import consejo2 from '../../assets/images/inicio/consejo-2.jpg';
import consejo3 from '../../assets/images/inicio/consejo-3.jpg';

const CONSEJOS = [
  { src: consejo1, texto: 'Alimentación saludable para gatos' },
  { src: consejo2, texto: 'Cómo socializar a tu gatito nuevo' },
  { src: consejo3, texto: 'Vacunas esenciales en el primer año' },
];

// Galería de consejos (antes era un carrusel; el mockup la muestra en cuadrícula)
export const ConsejosCarousel = () => (
  <section className="seccion-consejos">
    <Container>
      <p className="seccion-subtitulo">Para los dueños</p>
      <h2 className="seccion-titulo mb-4 mb-lg-5">Consejos y tips para tus mascotas</h2>
      <Row className="g-3">
        {CONSEJOS.map(({ src, texto }) => (
          <Col sm={6} lg={4} key={texto}>
            <div className="consejo-card">
              <img src={src} alt={texto} loading="lazy" />
              <div className="consejo-card-overlay">{texto}</div>
            </div>
          </Col>
        ))}
      </Row>
    </Container>
  </section>
);
