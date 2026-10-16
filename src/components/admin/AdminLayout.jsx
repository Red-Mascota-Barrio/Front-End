import { useCallback, useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { adminService, ESTADOS_REPORTE } from '../../services/adminService';
import { confirmar, estadoReporteId } from '../../utils/admin';
import { AdminIcon } from './AdminIcon';
import { Badge } from './AdminUI';
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
  <NavLink to={to} end={end} className={({ isActive }) => `adm-sidebar-item${isActive ? ' activo' : ''}`}>
    <AdminIcon nombre={icono} />
    {children}
  </NavLink>
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
    <div className={`adm-app${menuAbierto ? ' menu-abierto' : ''}`}>
      {/* SIDEBAR */}
      <aside className="adm-sidebar">
        <Link to="/admin" className="adm-sidebar-logo">
          <img src={logo} alt="" onError={(e) => (e.currentTarget.style.display = 'none')} />
          Red de Mascotas
        </Link>

        <div className="adm-sidebar-seccion">Principal</div>
        <ItemMenu to="/admin" icono="dashboard" end>Dashboard</ItemMenu>

        <div className="adm-sidebar-seccion">Gestión</div>
        <ItemMenu to="/admin/usuarios" icono="usuarios">Usuarios</ItemMenu>
        <ItemMenu to="/admin/mascotas" icono="corazon">Mascotas</ItemMenu>
        <ItemMenu to="/admin/eventos" icono="calendario">Eventos</ItemMenu>
        <ItemMenu to="/foro" icono="foro">Foros</ItemMenu>

        <div className="adm-sidebar-divider" />
        <div className="adm-sidebar-seccion">Moderación</div>
        <NavLink to="/admin/reportes" className={({ isActive }) => `adm-sidebar-item${isActive ? ' activo' : ''}`}>
          <AdminIcon nombre="alerta" />
          Reportes
          {reportesPendientes > 0 && <Badge clase="adm-badge-rojo">{reportesPendientes}</Badge>}
        </NavLink>

        <div className="adm-sidebar-divider" />
        <ItemMenu to="/" icono="casa">Ver sitio público</ItemMenu>
        <button type="button" className="adm-sidebar-item adm-sidebar-cerrar" onClick={cerrarSesion}>
          <AdminIcon nombre="salir" />
          Cerrar sesión
        </button>
      </aside>
      <div className="adm-sidebar-fondo" onClick={() => setMenuAbierto(false)} />

      {/* CONTENIDO */}
      <div className="adm-main">
        <header className="adm-topbar">
          <div className="adm-topbar-izq">
            <button type="button" className="adm-menu-btn" onClick={() => setMenuAbierto(!menuAbierto)} aria-label="Abrir menú">
              <AdminIcon nombre="menu" size={18} />
            </button>
            <div className="adm-breadcrumb">
              <span>Panel Admin</span>
              <AdminIcon nombre="chevron" size={14} />
              <strong>{seccion}</strong>
            </div>
          </div>
          <div className="adm-topbar-acciones">
            <button
              type="button"
              className="adm-notif-btn"
              title="Reportes pendientes"
              onClick={() => navigate('/admin/reportes')}
            >
              <AdminIcon nombre="campana" size={18} />
              {reportesPendientes > 0 && <span className="adm-notif-badge">{reportesPendientes}</span>}
            </button>
            <span className="adm-topbar-label">{nombre}</span>
            <div className="adm-avatar-admin" title={nombre}>{String(nombre).charAt(0)}</div>
          </div>
        </header>

        <main className="adm-contenido">
          <Outlet context={{ reportesPendientes, refrescarReportes }} />
        </main>
      </div>
    </div>
  );
};
