import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/Auth/Login';
import { Registro } from '../pages/Auth/Registro';
import { Recuperar } from '../pages/Auth/Recuperar';
import { Inicio } from '../pages/Inicio/Inicio';
import { InicioAdmin } from '../pages/Inicio/InicioAdmin';
import { ProtectedRoute } from './ProtectedRoute';

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
      
      {/* =======================
          RUTAS EXCLUSIVAS DE ADMINISTRACIÓN (Solo Admin)
      ======================== */}
      <Route element={<ProtectedRoute allowedRoles={[1]} />}>
        <Route path="/admin" element={<InicioAdmin />} />
      </Route>

      {/* Redirección automática por si escriben cualquier otra ruta */}
      <Route path="*" element={<Navigate to="/inicio" replace />} />
    </Routes>
  );
};