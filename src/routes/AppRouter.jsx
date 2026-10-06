import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/Auth/Login';
import { Registro } from '../pages/Auth/Registro';
import { Recuperar } from '../pages/Auth/Recuperar';
import { Inicio } from '../pages/Inicio/Inicio';
import { ProtectedRoute } from './ProtectedRoute';
import  Foro  from '../pages/Foro/Foro';
import ForoDetalle from '../pages/Foro/ForoDetalle';


export const AppRouter = () => {
  return (
    <Routes>
      {/* =======================
          RUTAS PÚBLICAS
      ======================== */}
      {/*  manda a login directamente*/}
      <Route path="/" element={<Inicio />} />
      <Route path="/" element={<Navigate to="/inicio" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/recuperar" element={<Recuperar />} />
      <Route path="/foro" element={<Foro />} />
      <Route path="/foro/:id" element={<ForoDetalle />} />
      
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

        
      </Route>

    </Routes>
  );
};