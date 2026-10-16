import { useCallback, useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { Button, Nav, Offcanvas } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { adminService, ESTADOS_REPORTE } from '../../services/adminService';
import { confirmar, estadoReporteId } from '../../utils/admin';
import { AdminIcon } from './AdminIcon';
import logo from '../../assets/images/inicio/logo.png';
import '../../styles/admin.css';

const TITULOS = {
  '/admin': 'Dashboard',
  '/admin/usuarios': 'Usuarios',
  '/admin/mascotas': 'Mascotas',
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
            <ItemMenu to="/admin/eventos" icono="calendario">Eventos</ItemMenu>
            <ItemMenu to="/foro" icono="foro">Foros</ItemMenu>

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
        <header className="navbar bg-white border-bottom px-3 px-lg-4 py-2 sticky-top shadow-sm">
          <div className="d-flex align-items-center gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              className="d-lg-none"
              onClick={() => setMenuAbierto(!menuAbierto)}
              aria-label="Abrir menú"
            >
              <AdminIcon nombre="menu" size={18} />
            </Button>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0 small">
                <li className="breadcrumb-item text-secondary">Panel Admin</li>
                <li className="breadcrumb-item active fw-semibold text-body" aria-current="page">{seccion}</li>
              </ol>
            </nav>
          </div>

          <div className="d-flex align-items-center gap-3">
            <Button
              variant="light"
              className="position-relative rounded-circle adm-btn-icono"
              title="Reportes pendientes"
              onClick={() => navigate('/admin/reportes')}
            >
              <AdminIcon nombre="campana" size={18} />
              {reportesPendientes > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {reportesPendientes}
                </span>
              )}
            </Button>
            <span className="small text-secondary fw-medium d-none d-sm-inline">{nombre}</span>
            <div className="adm-avatar rounded-circle bg-success text-white fw-bold" title={nombre}>
              {String(nombre).charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-grow-1 p-3 p-md-4">
          <Outlet context={{ reportesPendientes, refrescarReportes }} />
        </main>
      </div>
    </div>
  );
};
