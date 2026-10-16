import { Container, Carousel } from 'react-bootstrap';
import consejo1 from '../../assets/images/inicio/consejo-1.jpeg';
import consejo2 from '../../assets/images/inicio/consejo-2.jpg';
import consejo3 from '../../assets/images/inicio/consejo-3.jpg';

const SLIDES = [
  { src: consejo1, alt: 'Consejo para mascotas 1' },
  { src: consejo2, alt: 'Consejo para mascotas 2' },
  { src: consejo3, alt: 'Consejo para mascotas 3' },
];

export const ConsejosCarousel = () => (
  <section className="py-5 bg-light">
    <Container className="py-4">
      <h2 className="text-center fw-bold text-dark mb-5">Consejos para mascotas</h2>
      <Carousel className="rounded-4 shadow-lg overflow-hidden">
        {SLIDES.map(({ src, alt }) => (
          <Carousel.Item key={alt}>
            <img 
              src={src} 
              alt={alt} 
              className="d-block w-100" 
              style={{ maxHeight: '500px', objectFit: 'cover' }}
            />
          </Carousel.Item>
        ))}
      </Carousel>
    </Container>
  </section>
);