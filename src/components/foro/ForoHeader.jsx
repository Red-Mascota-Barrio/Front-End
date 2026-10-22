import { Container, Button } from 'react-bootstrap';
import { Icono } from '../common/Icono';

function ForoHeader({ onCrearHilo }) {
  return (
    <section className="pagina-hero">
      <Container className="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <h1>Foro de la comunidad</h1>
          <p>Comparte experiencias, haz preguntas y ayuda a otros dueños de mascotas</p>
        </div>
        <Button className="btn-blanco" onClick={onCrearHilo}>
          <Icono nombre="pencil-square" /> Nuevo foro
        </Button>
      </Container>
    </section>
  );
}

export default ForoHeader;
