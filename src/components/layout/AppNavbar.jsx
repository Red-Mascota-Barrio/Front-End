import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import logo from '../../assets/inicio/logo.png';
import '../../assets/home.css';

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
    <Navbar expand="lg" sticky="top" className="inicio-header shadow-sm">
      <Container fluid>
        <Navbar.Brand as={Link} to="/">
          <img src={logo} alt="Logo" className="inicio-logo" />
          Red de Mascotas de Barrio
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-principal" />

        <Navbar.Collapse id="navbar-principal" className="justify-content-end">
          <Nav className="align-items-lg-center gap-lg-2">
            <Nav.Link as={Link} to="/">Inicio</Nav.Link>
            <Nav.Link as={Link} to="/mascotas">Adopta</Nav.Link>
            <Nav.Link as={Link} to="/foro">Foros</Nav.Link>
            <Nav.Link as={Link} to="/mis-mascotas">Mascotas</Nav.Link>

            {haySesion ? (
              <>
                <span className="inicio-saludo">Hola, {user.nombre ?? user.correo}</span>
                <Nav.Link as={Link} to="/dashboard" className="btn-nav-solid">Mi panel</Nav.Link>
                <Nav.Link as="button" type="button" className="btn-nav-outline" onClick={handleLogout}>
                  Cerrar sesión
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="btn-nav-outline">Iniciar sesión</Nav.Link>
                <Nav.Link as={Link} to="/registro" className="btn-nav-solid">Registrarse</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
