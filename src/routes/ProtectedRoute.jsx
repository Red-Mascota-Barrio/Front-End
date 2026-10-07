import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from 'react-bootstrap';

export const ProtectedRoute = ({ allowedRoles }) => {
  const { user, token, role, loading } = useAuth();

  // Mientras React lee el localStorage, mostramos un pequeño loader
  if (loading) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center bg-light">
        <Spinner animation="border" style={{ color: '#0f765c' }} />
      </div>
    );
  }

  // Si no hay sesión, patada de vuelta al login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Si la ruta exige un rol específico (ej. solo 'admin') y el usuario no lo tiene
  if (allowedRoles && !allowedRoles.includes(Number(role))) {
    return <Navigate to="/inicio" replace />; 
  }

  // Si pasa todas las validaciones, renderizamos la ruta hija que tus compañeros construyan
  return <Outlet />;
};