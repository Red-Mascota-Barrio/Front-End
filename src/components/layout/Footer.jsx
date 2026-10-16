import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/inicio/logo.png';

export const Footer = () => (
  <footer className="bg-white border-top py-4 mt-auto">
    <Container className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
      <div className="d-flex align-items-center">
        <img 
          src={logo} 
          alt="Logo" 
          width="40" 
          height="40" 
          className="rounded-circle me-2" 
        />
        <strong className="text-primary">Red de Mascotas de Barrio</strong>
      </div>
      
      <div className="d-flex gap-3">
        <Link to="/login" className="text-decoration-none text-secondary">
          Iniciar sesión
        </Link>
        <Link to="/registro" className="text-decoration-none text-secondary">
          Registrarse
        </Link>
      </div>
      
      <small className="text-muted">
        © {new Date().getFullYear()} Todos los derechos reservados.
      </small>
    </Container>
  </footer>
);