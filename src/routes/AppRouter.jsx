import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/Auth/Login';
import { Registro } from '../pages/Auth/Registro';
import { Recuperar } from '../pages/Auth/Recuperar';
import { Inicio } from '../pages/Inicio/Inicio';
import { Perfil } from '../pages/Perfil/Perfil';
import { EditarPerfil } from '../pages/Perfil/EditarPerfil';
import { InicioAdmin } from '../pages/Inicio/InicioAdmin';
import { ProtectedRoute } from './ProtectedRoute';
import  Foro  from '../pages/Foro/Foro';
import ForoDetalle from '../pages/Foro/ForoDetalle';


export const AppRouter = () => {
  return (  
    <Routes>
      {/* =======================
          RUTAS PÚBLICAS
      ======================== */}
      <Route path="/inicio" element={<Inicio />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/recuperar" element={<Recuperar />} />
      <Route path="/foro" element={<Foro />} />
      <Route path="/foro/:id" element={<ForoDetalle />} />
      
      {/* =======================
          RUTAS EXCLUSIVAS DE ADMINISTRACIÓN (Solo Admin)
      ======================== */}
      {/* si ponen la ruta necesita haber iniciado sesion */}
      <Route element={<ProtectedRoute allowedRoles={['usuario', 'admin']} />}>
        <Route path="/dashboard" element={
          <div className="vh-100 d-flex justify-content-center align-items-center bg-light">
            <h2 className="text-muted">Panel Principal (Módulo en construcción)</h2>
          </div>
        } />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/perfil/editar" element={<EditarPerfil />} />
          
      <Route element={<ProtectedRoute allowedRoles={[1]} />}>
        <Route path="/admin" element={<InicioAdmin />} />
      </Route>

      {/* Redirección automática por si escriben cualquier otra ruta */}
      <Route path="*" element={<Navigate to="/inicio" replace />} />
    </Routes>
  );
};