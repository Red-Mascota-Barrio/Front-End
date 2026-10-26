import { Container, Row, Col, Nav, Tab } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import { AppNavbar } from '../../components/layout/AppNavbar';
import { Footer } from '../../components/layout/Footer';
import { FormDatos } from '../../components/perfil/FormDatos';
import { FormContrasena } from '../../components/perfil/FormContrasena';
import { EliminarCuenta } from '../../components/perfil/EliminarCuenta';
import { FormNotificaciones } from '../../components/perfil/FormNotificaciones';
import { Icono } from '../../components/common/Icono';
import '../../styles/perfil.css';

const SECCIONES = [
  { clave: 'datos', texto: 'Información personal', icono: 'person' },
  { clave: 'seguridad', texto: 'Seguridad', icono: 'shield-lock' },
  { clave: 'notificaciones', texto: 'Notificaciones', icono: 'bell' },
];

// Editar perfil con navegación lateral (Editar_perfil.html del mockup)
export const EditarPerfil = () => {
  // Permite abrir directo una sección: /perfil/editar?tab=notificaciones
  const [params] = useSearchParams();
  const seccion = SECCIONES.some((s) => s.clave === params.get('tab')) ? params.get('tab') : 'datos';

  return (
  <div className="d-flex flex-column min-vh-100">
    <AppNavbar />
    <main className="flex-grow-1">
      <Container className="perfil-layout">
        <Link to="/perfil" className="perfil-volver"><Icono nombre="arrow-left" /> Volver a mi perfil</Link>
        <h1 className="h3 fw-bold text-verde-oscuro mt-3 mb-4">Configuración de la cuenta</h1>

        <Tab.Container key={seccion} defaultActiveKey={seccion} mountOnEnter>
          <Row className="g-4">
            <Col lg={3}>
              <Nav variant="pills" className="perfil-nav flex-column gap-1">
                {SECCIONES.map((s) => (
                  <Nav.Item key={s.clave}>
                    <Nav.Link eventKey={s.clave}><Icono nombre={s.icono} /> {s.texto}</Nav.Link>
                  </Nav.Item>
                ))}
              </Nav>
            </Col>
            <Col lg={9}>
              <Tab.Content>
                <Tab.Pane eventKey="datos">
                  <FormDatos />
                </Tab.Pane>
                <Tab.Pane eventKey="seguridad">
                  <FormContrasena />
                  <EliminarCuenta />
                </Tab.Pane>
                <Tab.Pane eventKey="notificaciones">
                  <FormNotificaciones />
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </Container>
    </main>
    <Footer />
  </div>
  );
};
