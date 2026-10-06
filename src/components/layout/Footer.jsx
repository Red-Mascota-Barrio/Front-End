import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import logo from '../../assets/inicio/logo.png';
import '../../assets/home.css';

export const Footer = () => (
  <footer className="inicio-footer mt-auto">
    <Container className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
      <div className="d-flex align-items-center gap-2">
        <img src={logo} alt="Logo" className="inicio-logo" />
        <strong>Red de Mascotas de Barrio</strong>
      </div>
      <div className="d-flex gap-3">
        <Link to="/login">Iniciar sesión</Link>
        <Link to="/registro">Registrarse</Link>
      </div>
      <small>© {new Date().getFullYear()} Todos los derechos reservados.</small>
    </Container>
  </footer>
);
