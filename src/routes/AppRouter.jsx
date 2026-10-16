import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/Auth/Login';
import { Registro } from '../pages/Auth/Registro';
import { Recuperar } from '../pages/Auth/Recuperar';
import { Inicio } from '../pages/Inicio/Inicio';
import { ProtectedRoute } from './ProtectedRoute';
import { Eventos } from '../pages/Eventos/Eventos';
import { Perfil } from '../pages/Perfil/Perfil';
import { EditarPerfil } from '../pages/Perfil/EditarPerfil';
import Foro  from '../pages/Foro/Foro';
//import Mascotas from '../pages/Mascotas/Mascotas'
import ForoDetalle from '../pages/Foro/ForoDetalle';


export const AppRouter = () => {
  return (  
    <Routes>
      {/* =======================
          RUTAS PÚBLICAS
      ======================== */}
      {/*  manda a login directamente*/}
      <Route path="/" element={<Inicio />} /> 
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/recuperar" element={<Recuperar />} />
      <Route path="/eventos" element={<Eventos />} />
      <Route path="/foro" element={<Foro />} />
      <Route path="/foro/:id" element={<ForoDetalle />} />
      
      {/* =======================
          RUTAS EXCLUSIVAS DE ADMINISTRACIÓN (Solo Admin)
      ======================== */}
      {/* si ponen la ruta necesita haber iniciado sesion */}
      <Route element={<ProtectedRoute allowedRoles={[1, 2]} />}>

        <Route path="/perfil" element={<Perfil />} />
        <Route path="/perfil/editar" element={<EditarPerfil />} />
        
      </Route>

      

      {/* Redirección automática por si escriben cualquier otra ruta */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
