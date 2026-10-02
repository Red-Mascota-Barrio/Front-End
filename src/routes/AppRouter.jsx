import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/Auth/Login';
import { LoginAdmin } from '../pages/Auth/LoginAdmin';
import { Registro } from '../pages/Auth/Registro';
import { Recuperar } from '../pages/Auth/Recuperar';
import { ProtectedRoute } from './ProtectedRoute';
import { ForoList } from '../components/foro/ForoList';
import { ForoDetalle } from '../components/foro/ForoDetalle';

export const AppRouter = () => {
  return (
    <Routes>
      {/* =======================
          RUTAS PÚBLICAS
      ======================== */}
      {/*  manda a login directamente*/}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/login-admin" element={<LoginAdmin />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/recuperar" element={<Recuperar />} />

      {/* =======================
          RUTAS PRIVADAS 
      ======================== */}
      {/* si ponen la ruta necesita haber iniciado sesion */}
      <Route element={<ProtectedRoute allowedRoles={['usuario', 'admin']} />}>
        <Route path="/dashboard" element={
          <div className="vh-100 d-flex justify-content-center align-items-center bg-light">
            <h2 className="text-muted">Panel Principal (Módulo en construcción)</h2>
          </div>
        } />

        //ruta de foro
        <Route path="/foro" element={<ForoList />} />
        <Route path="/foro/:id" element={<ForoDetalle />} />

      </Route>

    </Routes>
  );
};