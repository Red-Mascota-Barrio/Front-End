import { Container, Tabs, Tab } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaLock, FaBell } from 'react-icons/fa';
import { AppNavbar } from '../../components/layout/AppNavbar';
import { Footer } from '../../components/layout/Footer';
import { FormDatos } from '../../components/perfil/FormDatos';
import { FormContrasena } from '../../components/perfil/FormContrasena';
import { EliminarCuenta } from '../../components/perfil/EliminarCuenta';
import { FormNotificaciones } from '../../components/perfil/FormNotificaciones';
import '../../styles/home.css';
import '../../styles/perfil.css';

export const EditarPerfil = () => (
  <div className="inicio-page d-flex flex-column min-vh-100">
    <AppNavbar />
    <main className="flex-grow-1 py-4">
      <Container className="perfil-editar">
        <Link to="/perfil" className="perfil-volver">
          <FaArrowLeft className="me-2" /> Volver a mi perfil
        </Link>
        <h2 className="inicio-titulo text-start mt-3">Editar perfil</h2>

        <div className="inicio-card perfil-editar-card">
          <Tabs defaultActiveKey="datos" className="perfil-tabs mb-4" fill>
            <Tab eventKey="datos" title={<><FaUser className="me-2" />Datos</>}>
              <FormDatos />
            </Tab>
            <Tab eventKey="seguridad" title={<><FaLock className="me-2" />Seguridad</>}>
              <FormContrasena />
              <hr className="my-4" />
              <EliminarCuenta />
            </Tab>
            <Tab eventKey="notificaciones" title={<><FaBell className="me-2" />Notificaciones</>} mountOnEnter>
              <FormNotificaciones />
            </Tab>
          </Tabs>
        </div>
      </Container>
    </main>
    <Footer />
  </div>
);
