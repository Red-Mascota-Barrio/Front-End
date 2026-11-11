import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Componente de carga liviano mientras se descarga el chunk asíncrono
const LoadingFallback = () => (
  <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '60vh' }}>
    <div className="spinner-border" role="status" style={{ color: '#0f765e', width: '3rem', height: '3rem' }}>
      <span className="visually-hidden">Cargando...</span>
    </div>
  </div>
);

// ======================= PÁGINA PRINCIPAL =======================
const Inicio = lazy(() => import('../pages/Inicio/Inicio').then((m) => ({ default: m.Inicio })));

// ======================= AUTENTICACIÓN (Chunks independientes) =======================
const Login = lazy(() => import('../pages/Auth/Login').then((m) => ({ default: m.Login })));
const Registro = lazy(() => import('../pages/Auth/Registro').then((m) => ({ default: m.Registro })));
const Recuperar = lazy(() => import('../pages/Auth/Recuperar').then((m) => ({ default: m.Recuperar })));

// ======================= COMUNIDAD Y CONTENIDO =======================
const Eventos = lazy(() => import('../pages/Eventos/Eventos').then((m) => ({ default: m.Eventos })));
const Foro = lazy(() => import('../pages/Foro/Foro'));
const ForoDetalle = lazy(() => import('../pages/Foro/ForoDetalle'));
const MascotasPage = lazy(() => import('../pages/Mascotas/Mascotas').then((m) => ({ default: m.MascotasPage })));

// ======================= PERFIL DE USUARIO =======================
const Perfil = lazy(() => import('../pages/Perfil/Perfil').then((m) => ({ default: m.Perfil })));
const EditarPerfil = lazy(() => import('../pages/Perfil/EditarPerfil').then((m) => ({ default: m.EditarPerfil })));
const MisMascotasPage = lazy(() => import('../pages/Mascotas/MisMascotas').then((m) => ({ default: m.MisMascotasPage })));

// ======================= PANEL DE ADMINISTRACIÓN (Módulo pesado segregado) =======================
const AdminLayout = lazy(() => import('../components/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import('../pages/Admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
const AdminUsuarios = lazy(() => import('../pages/Admin/AdminUsuarios').then((m) => ({ default: m.AdminUsuarios })));
const AdminMascotas = lazy(() => import('../pages/Admin/AdminMascotas').then((m) => ({ default: m.AdminMascotas })));
const AdminEventos = lazy(() => import('../pages/Admin/AdminEventos').then((m) => ({ default: m.AdminEventos })));
const AdminReportes = lazy(() => import('../pages/Admin/AdminReportes').then((m) => ({ default: m.AdminReportes })));
const AdminAdopciones = lazy(() => import('../pages/Admin/AdminAdopciones').then((m) => ({ default: m.AdminAdopciones })));
const AdminForos = lazy(() => import('../pages/Admin/AdminForos').then((m) => ({ default: m.AdminForos })));

// Roles (RoleSeeder): 1 = Administrador, 2 = Usuario
const ADMIN = 1;
const USUARIO = 2;

export const AppRouter = () => (
  <Suspense fallback={<LoadingFallback />}>
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
          <Route path="adopciones" element={<AdminAdopciones />} />
          <Route path="foros" element={<AdminForos />} />
          <Route path="eventos" element={<AdminEventos />} />
          <Route path="reportes" element={<AdminReportes />} />
        </Route>
      </Route>

      {/* Cualquier otra ruta vuelve al inicio */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
);
