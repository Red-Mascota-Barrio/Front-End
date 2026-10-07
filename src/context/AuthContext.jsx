import { createContext, useContext, useState, useEffect } from 'react';
import { statsService } from '../services/statsService'; // Ajusta la ruta exacta a tu statsService

// Creamos el contexto
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [role, setRole] = useState(() => localStorage.getItem('role') || null);
  const [user, setUser] = useState(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!storedToken || !storedUser) return null;

    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  });
  const loading = false;

  const [stats, setStats] = useState(null);
  const [cargandoStats, setCargandoStats] = useState(true);

 
  useEffect(() => {
    statsService
      .obtener()
      .then((datos) => setStats(datos))
      .catch((error) => console.error('Error cargando estadísticas en AuthContext:', error))
      .finally(() => setCargandoStats(false));
  }, []); 

  // Función de inicio de sesión
  const login = (userData, userToken, userRole) => {
    setUser(userData);
    setToken(userToken);
    setRole(userRole);

    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('role', userRole);
  };

  // Función de cierre de sesión
  const logout = () => {
    setUser(null);
    setToken(null);
    setRole(null);

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        role, 
        login, 
        logout, 
        loading,
        stats,          // <-- Exportamos las estadísticas globales
        cargandoStats   // <-- Exportamos el estado de carga global
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto fácilmente
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
