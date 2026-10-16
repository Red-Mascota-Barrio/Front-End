import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import logo from '../../assets/images/inicio/logo.png';
import '../../styles/home.css'; // Puedes eliminar de este archivo las clases antiguas del navbar

export const AppNavbar = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const haySesion = Boolean(token && user);

  const handleLogout = async () => {
    try {
      await authService.logout(); // invalida el token en Laravel
    } catch (error) {
      console.error('Error al cerrar sesión en el servidor:', error);
    } finally {
      logout(); // limpia contexto y localStorage pase lo que pase
      navigate('/');
    }
  };

  return (
    <Navbar bg="white" expand="lg" sticky="top" className="shadow-sm py-2">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center fw-bold text-primary">
          <img 
            src={logo} 
            alt="Logo" 
            width="40" 
            height="40" 
            className="d-inline-block align-top me-2 rounded-circle" 
          />
          Red de Mascotas de Barrio
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-principal" className="border-0 shadow-none" />

        <Navbar.Collapse id="navbar-principal" className="justify-content-end">
          <Nav className="align-items-lg-center gap-3">
            <Nav.Link as={Link} to="/" className="fw-medium text-dark">Inicio</Nav.Link>
            <Nav.Link as={Link} to="/mascotas" className="fw-medium text-dark">Adopta</Nav.Link>
            <Nav.Link as={Link} to="/eventos" className="fw-medium text-dark">Eventos</Nav.Link>
            <Nav.Link as={Link} to="/foro" className="fw-medium text-dark">Foros</Nav.Link>

            {haySesion ? (
              <>
                <Navbar.Text className="fw-semibold text-secondary me-lg-2">
                  Hola, {user.nombre ?? user.correo}
                </Navbar.Text>
                <Nav.Link as={Link} to="/perfil" className="btn btn-primary text-white px-4 rounded-pill">
                  Mi perfil
                </Nav.Link>
                <Nav.Link 
                  as="button" 
                  type="button" 
                  className="btn btn-outline-danger px-4 rounded-pill mt-2 mt-lg-0" 
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="btn btn-outline-primary px-4 rounded-pill">
                  Iniciar sesión
                </Nav.Link>
                <Nav.Link as={Link} to="/registro" className="btn btn-outline-primary px-4 rounded-pill">
                  Registrarse
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};