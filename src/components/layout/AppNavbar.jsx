import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { NotificacionesCampana } from './NotificacionesCampana';
import { urlFoto, iniciales } from '../../utils/perfil';
import logo from '../../assets/images/inicio/logo.png';

const ENLACES = [
  { to: '/', texto: 'Inicio', end: true },
  { to: '/mascotas', texto: 'Adoptar' },
  { to: '/foro', texto: 'Foros' },
  { to: '/eventos', texto: 'Eventos' },
];

export const AppNavbar = () => {
  const { user, token, role, logout } = useAuth();
  const navigate = useNavigate();
  const haySesion = Boolean(token && user);
  const esAdmin = Number(role) === 1;
  const foto = urlFoto(user);

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
    <Navbar expand="lg" sticky="top" className="app-navbar" collapseOnSelect>
      <Container fluid className="px-3 px-lg-4">
        <Navbar.Brand as={Link} to="/">
          <img src={logo} alt="" />
          Red de Mascotas de Barrio
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-principal" aria-label="Abrir menú" />

        <Navbar.Collapse id="navbar-principal">
          <Nav className="nav-principal mx-lg-auto gap-lg-1">
            {ENLACES.map(({ to, texto, end }) => (
              <Nav.Link key={to} as={NavLink} to={to} end={end} eventKey={to}>
                {texto}
              </Nav.Link>
            ))}
          </Nav>

          <div className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center gap-2 mt-2 mt-lg-0">
            {haySesion ? (
              <>
                {esAdmin && (
                  <Button as={Link} to="/admin" variant="outline-primary" size="sm">
                    <i className="bi bi-speedometer2" aria-hidden="true" /> Panel admin
                  </Button>
                )}
                <NotificacionesCampana />
                <Link
                  to="/perfil"
                  className="d-flex align-items-center gap-2 text-decoration-none px-lg-1"
                  title="Mi perfil"
                >
                  <span className="avatar-inicial">
                    {foto ? <img src={foto} alt="" /> : iniciales(user)}
                  </span>
                  <span className="navbar-saludo d-lg-none d-xl-inline">
                    Hola, <strong>{user.nombre ?? user.correo}</strong>
                  </span>
                </Link>
                <Button variant="light" size="sm" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right" aria-hidden="true" /> Salir
                </Button>
              </>
            ) : (
              <>
                <Button as={Link} to="/login" variant="light" size="sm">
                  Iniciar sesión
                </Button>
                <Button as={Link} to="/registro" variant="primary" size="sm">
                  Registrarse
                </Button>
              </>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
