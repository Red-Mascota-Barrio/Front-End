import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/Auth/Login';
import { Registro } from '../pages/Auth/Registro';
import { Recuperar } from '../pages/Auth/Recuperar';
import { Inicio } from '../pages/Inicio/Inicio';
import { ProtectedRoute } from './ProtectedRoute';
import { Eventos } from '../pages/Eventos/Eventos';
import { Perfil } from '../pages/Perfil/Perfil';
import { EditarPerfil } from '../pages/Perfil/EditarPerfil';
import Foro from '../pages/Foro/Foro';
import ForoDetalle from '../pages/Foro/ForoDetalle';
import { MascotasPage } from '../pages/Mascotas/Mascotas';
import { MisMascotasPage } from '../pages/Mascotas/MisMascotas';
import { AdminLayout } from '../components/admin/AdminLayout';
import { AdminDashboard } from '../pages/Admin/AdminDashboard';
import { AdminUsuarios } from '../pages/Admin/AdminUsuarios';
import { AdminMascotas } from '../pages/Admin/AdminMascotas';
import { AdminEventos } from '../pages/Admin/AdminEventos';
import { AdminReportes } from '../pages/Admin/AdminReportes';

// Roles (RoleSeeder): 1 = Administrador, 2 = Usuario
const ADMIN = 1;
const USUARIO = 2;

export const AppRouter = () => (
  <Routes>
    {/* ======================= RUTAS PÚBLICAS ======================= */}
    <Route path="/" element={<Inicio />} />
    <Route path="/login" element={<Login />} />
    <Route path="/registro" element={<Registro />} />
    <Route path="/recuperar" element={<Recuperar />} />
    <Route path="/eventos" element={<Eventos />} />
    <Route path="/foro" element={<Foro />} />
    <Route path="/foro/:id" element={<ForoDetalle />} />
    <Route path="/foros" element={<Navigate to="/foro" replace />} />
    <Route path="/mascotas" element={<MascotasPage />} />

    {/* ============ RUTAS CON SESIÓN (usuario y administrador) ============ */}
    <Route element={<ProtectedRoute allowedRoles={[ADMIN, USUARIO]} />}>
      <Route path="/perfil" element={<Perfil />} />
      <Route path="/perfil/editar" element={<EditarPerfil />} />
      <Route path="/mis-mascotas" element={<MisMascotasPage />} />
    </Route>

    {/* ================ PANEL DE ADMINISTRACIÓN (solo admin) ================ */}
    <Route element={<ProtectedRoute allowedRoles={[ADMIN]} />}>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="usuarios" element={<AdminUsuarios />} />
        <Route path="mascotas" element={<AdminMascotas />} />
        <Route path="eventos" element={<AdminEventos />} />
        <Route path="reportes" element={<AdminReportes />} />
      </Route>
    </Route>

    {/* Cualquier otra ruta vuelve al inicio */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
