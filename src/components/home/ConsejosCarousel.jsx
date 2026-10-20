import { Container, Carousel } from 'react-bootstrap';
import consejo1 from '../../assets/inicio/consejo-1.jpeg';
import consejo2 from '../../assets/inicio/consejo-2.jpg';
import consejo3 from '../../assets/inicio/consejo-3.jpg';
import '../../assets/home.css';

const SLIDES = [
  { src: consejo1, alt: 'Consejo para mascotas 1' },
  { src: consejo2, alt: 'Consejo para mascotas 2' },
  { src: consejo3, alt: 'Consejo para mascotas 3' },
];

export const ConsejosCarousel = () => (
  <section className="inicio-seccion">
    <Container>
      <h2 className="inicio-titulo">Consejos para mascotas</h2>
      <Carousel className="inicio-carousel">
        {SLIDES.map(({ src, alt }) => (
          <Carousel.Item key={alt}>
            <img src={src} alt={alt} className="d-block w-100" />
          </Carousel.Item>
        ))}
      </Carousel>
    </Container>
  </section>
);
