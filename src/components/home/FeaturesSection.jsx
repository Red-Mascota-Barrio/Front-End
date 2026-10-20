import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Icono } from '../common/Icono';

const FEATURES = [
  {
    titulo: 'Adoptar',
    texto: 'Encuentra tu compañero perfecto entre perros y gatos que buscan un hogar. Filtra por especie, tamaño y género.',
    to: '/mascotas',
    link: 'Ver mascotas',
    icono: 'heart',
  },
  {
    titulo: 'Comunidad',
    texto: 'Participa en foros sobre cuidado animal, comparte experiencias y recibe consejos de otros dueños.',
    to: '/foro',
    link: 'Ir al foro',
    icono: 'people',
  },
  {
    titulo: 'Mis mascotas',
    texto: 'Registra a tus peludos con su foto, raza y estado de salud, y publícalos en adopción.',
    to: '/mis-mascotas?registrar=1',
    link: 'Registrar mascota',
    icono: 'clipboard-heart',
  },
  {
    titulo: 'Eventos',
    texto: 'Inscríbete a jornadas de vacunación, ferias de adopción y actividades de bienestar animal.',
    to: '/eventos',
    link: 'Ver eventos',
    icono: 'calendar-event',
  },
];

export const FeaturesSection = () => (
  <section className="seccion">
    <Container>
      <p className="seccion-subtitulo text-center">¿Qué puedes hacer aquí?</p>
      <h2 className="seccion-titulo text-center mb-5">Una plataforma para todo lo animal</h2>
      <Row className="g-4">
        {FEATURES.map(({ titulo, texto, to, link, icono }) => (
          <Col sm={6} lg={3} key={titulo}>
            <Link to={to} className="caracteristica">
              <div className="caracteristica-icono">
                <Icono nombre={icono} />
              </div>
              <h3 className="caracteristica-titulo">{titulo}</h3>
              <p className="caracteristica-texto">{texto}</p>
              <span className="caracteristica-link">{link} <Icono nombre="arrow-right" /></span>
            </Link>
          </Col>
        ))}
      </Row>
    </Container>
  </section>
);
