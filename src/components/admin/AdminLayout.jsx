import { useCallback, useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { Button, Nav, Offcanvas, Dropdown } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { adminService, ESTADOS_REPORTE } from '../../services/adminService';
import { confirmar, estadoReporteId } from '../../utils/admin';
import { urlFoto, iniciales } from '../../utils/perfil';
import { NotificacionesCampana } from '../layout/NotificacionesCampana';
import { AdminIcon } from './AdminIcon';
import logo from '../../assets/images/inicio/logo.png';
import '../../styles/admin.css';

const TITULOS = {
  '/admin': 'Dashboard',
  '/admin/usuarios': 'Usuarios',
  '/admin/mascotas': 'Mascotas',
  '/admin/adopciones': 'Adopciones',
  '/admin/foros': 'Foros',
  '/admin/eventos': 'Eventos',
  '/admin/reportes': 'Reportes',
};

const ItemMenu = ({ to, icono, children, end = false }) => (
  <Nav.Link as={NavLink} to={to} end={end}>
    <AdminIcon nombre={icono} />
    {children}
  </Nav.Link>
);

const Seccion = ({ children }) => (
  <div className="text-uppercase text-secondary fw-semibold small px-3 mt-3 mb-1 adm-sidebar-seccion">{children}</div>
);

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // El menú móvil queda abierto solo en la ruta donde se abrió (se cierra al navegar)
  const [menuAbiertoEn, setMenuAbiertoEn] = useState(null);
  const menuAbierto = menuAbiertoEn === pathname;
  const setMenuAbierto = (abrir) => setMenuAbiertoEn(abrir ? pathname : null);

  const [reportesPendientes, setReportesPendientes] = useState(null);
  const [recargaReportes, setRecargaReportes] = useState(0);

  // Las páginas llaman a esto cuando cambian reportes, para actualizar el badge
  const refrescarReportes = useCallback(() => setRecargaReportes((n) => n + 1), []);

  // Conteo de reportes pendientes para el badge del menú y la campana
  useEffect(() => {
    (async () => {
      try {
        const reportes = await adminService.listarReportes();
        setReportesPendientes(reportes.filter((r) => estadoReporteId(r) !== ESTADOS_REPORTE.RESUELTO).length);
      } catch {
        setReportesPendientes(null);
      }
    })();
  }, [recargaReportes]);

  const cerrarSesion = async () => {
    const ok = await confirmar({ titulo: '¿Cerrar sesión?', texto: 'Tendrás que volver a iniciar sesión para entrar al panel.', boton: 'Cerrar sesión', peligro: true });
    if (!ok) return;
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error al cerrar sesión en el servidor:', error);
    } finally {
      logout();
      navigate('/login', { replace: true });
    }
  };

  const nombre = user?.nombre ?? user?.correo ?? 'Administrador';
  const seccion = TITULOS[pathname.replace(/\/$/, '')] ?? 'Panel';
  const foto = urlFoto(user);

  return (
    <div className="adm-app d-flex">
      {/* SIDEBAR: fijo en pantallas grandes, Offcanvas en móvil */}
      <Offcanvas
        show={menuAbierto}
        onHide={() => setMenuAbierto(false)}
        responsive="lg"
        className="adm-sidebar"
        aria-label="Menú del panel"
      >
        <Offcanvas.Header closeButton className="border-bottom">
          <Offcanvas.Title className="fw-bold">Menú</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="d-flex flex-column p-3 w-100">
          <Link to="/admin" className="d-flex align-items-center gap-2 fw-bold fs-5 text-decoration-none adm-marca px-2 mb-2">
            <img src={logo} alt="" width="36" height="36" className="rounded-circle" onError={(e) => (e.currentTarget.style.display = 'none')} />
            Red de Mascotas
          </Link>

          <Nav className="flex-column gap-1 flex-grow-1 adm-nav">
            <Seccion>Principal</Seccion>
            <ItemMenu to="/admin" icono="dashboard" end>Dashboard</ItemMenu>

            <Seccion>Gestión</Seccion>
            <ItemMenu to="/admin/usuarios" icono="usuarios">Usuarios</ItemMenu>
            <ItemMenu to="/admin/mascotas" icono="corazon">Mascotas</ItemMenu>
            <ItemMenu to="/admin/adopciones" icono="house-heart">Adopciones</ItemMenu>
            <ItemMenu to="/admin/eventos" icono="calendario">Eventos</ItemMenu>
            <ItemMenu to="/admin/foros" icono="foro">Foros</ItemMenu>

            <hr className="my-2" />
            <Seccion>Moderación</Seccion>
            <ItemMenu to="/admin/reportes" icono="alerta">
              Reportes
              {reportesPendientes > 0 && (
                <span className="badge rounded-pill text-bg-danger ms-auto">{reportesPendientes}</span>
              )}
            </ItemMenu>

            <hr className="my-2" />
            <ItemMenu to="/" icono="casa">Ver sitio público</ItemMenu>
            <Nav.Link as="button" type="button" className="text-danger mt-auto text-start" onClick={cerrarSesion}>
              <AdminIcon nombre="salir" />
              Cerrar sesión
            </Nav.Link>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>

      {/* CONTENIDO */}
      <div className="flex-grow-1 d-flex flex-column min-vw-0" style={{ minWidth: 0 }}>
        <header className="navbar adm-topbar px-3 px-lg-4 py-2 sticky-top shadow-xs">
          <div className="d-flex align-items-center gap-2">
            <Button
              variant="outline-success"
              size="sm"
              className="d-lg-none rounded-pill px-2"
              onClick={() => setMenuAbierto(!menuAbierto)}
              aria-label="Abrir menú"
            >
              <AdminIcon nombre="menu" size={18} />
            </Button>
            <nav aria-label="breadcrumb" className="d-flex align-items-center gap-2">
              <span className="badge rounded-pill bg-success-subtle text-success-emphasis border border-success-subtle d-none d-sm-inline-block px-2 py-1">
                Panel Admin
              </span>
              <i className="bi bi-chevron-right text-muted small d-none d-sm-inline-block" aria-hidden="true" />
              <span className="fw-bold fs-6 text-dark mb-0">{seccion}</span>
            </nav>
          </div>

          <div className="d-flex align-items-center gap-2 gap-md-3">
            <Button
              as={Link}
              to="/"
              variant="outline-success"
              size="sm"
              className="d-none d-md-inline-flex align-items-center gap-1 rounded-pill px-3 py-1 fw-semibold"
            >
              <i className="bi bi-box-arrow-up-right me-1" aria-hidden="true" /> Sitio público
            </Button>

            {/* Campana interactiva de notificaciones de la plataforma */}
            <NotificacionesCampana />

            {/* Notificación rápida de reportes pendientes */}
            {reportesPendientes > 0 && (
              <Button
                as={Link}
                to="/admin/reportes"
                variant="light"
                className="position-relative rounded-circle adm-btn-icono border shadow-xs"
                title={`${reportesPendientes} reportes pendientes de moderación`}
              >
                <AdminIcon nombre="alerta" size={18} className="text-danger" />
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {reportesPendientes}
                </span>
              </Button>
            )}

            {/* Menú desplegable interactivo del perfil de administrador */}
            <Dropdown align="end">
              <Dropdown.Toggle
                as="button"
                type="button"
                className="adm-user-toggle d-flex align-items-center gap-2 border-0 bg-transparent p-1 rounded-pill"
                id="admin-user-menu"
                aria-label="Menú del administrador"
              >
                <span className="avatar-inicial">
                  {foto ? <img src={foto} alt="" /> : iniciales(user)}
                </span>
                <div className="d-none d-sm-flex flex-column text-start lh-1">
                  <span className="fw-bold small text-dark">{user?.nombre || nombre}</span>
                  <span className="text-success small fw-semibold" style={{ fontSize: '0.72rem' }}>
                    Administrador
                  </span>
                </div>
                <i className="bi bi-chevron-down text-muted small ms-1 d-none d-sm-inline" aria-hidden="true" />
              </Dropdown.Toggle>

              <Dropdown.Menu className="shadow-lg border-0 rounded-4 p-2 mt-2" style={{ minWidth: 230 }}>
                <div className="px-3 py-2 border-bottom mb-1 bg-light rounded-3">
                  <div className="fw-bold text-dark">{user?.nombre} {user?.apellido}</div>
                  <div className="small text-muted text-truncate">{user?.correo}</div>
                  <span className="badge rounded-pill bg-success-subtle text-success-emphasis border border-success-subtle mt-1">
                    Rol: Administrador
                  </span>
                </div>
                <Dropdown.Item as={Link} to="/perfil" className="rounded-3 py-2">
                  <i className="bi bi-person me-2 text-success" aria-hidden="true" /> Mi perfil
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/admin/reportes" className="rounded-3 py-2 d-flex justify-content-between align-items-center">
                  <span><i className="bi bi-shield-exclamation me-2 text-danger" aria-hidden="true" /> Moderación</span>
                  {reportesPendientes > 0 && (
                    <span className="badge bg-danger rounded-pill">{reportesPendientes}</span>
                  )}
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/" className="rounded-3 py-2">
                  <i className="bi bi-house me-2 text-primary" aria-hidden="true" /> Ver sitio público
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={cerrarSesion} className="rounded-3 py-2 text-danger fw-semibold">
                  <i className="bi bi-box-arrow-right me-2" aria-hidden="true" /> Cerrar sesión
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </header>

        <main className="flex-grow-1 p-3 p-md-4">
          <Outlet context={{ reportesPendientes, refrescarReportes }} />
        </main>
      </div>
    </div>
  );
};
