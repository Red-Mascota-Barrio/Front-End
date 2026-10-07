import { createContext, useContext, useState, useEffect } from 'react';
// Asegúrate de que la ruta a tu servicio sea la correcta según tu estructura
import { statsService } from '../services/statsService'; 

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

  // Estados separados para manejar ambas rutas de estadísticas
  const [statsGenerales, setStatsGenerales] = useState(null);
  const [statsUsuario, setStatsUsuario] = useState(null);
  const [cargandoStats, setCargandoStats] = useState(true);

  // Movemos las funciones arriba del useEffect para poder usar logout() dentro de él
  const login = (userData, userToken, userRole) => {
    setUser(userData);
    setToken(userToken);
    setRole(userRole);

    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('role', userRole);
  };

  const updateUser = (cambios) => {
    setUser((previo) => {
      const actualizado = { ...previo, ...cambios };
      localStorage.setItem('user', JSON.stringify(actualizado));
      return actualizado;
    });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRole(null);
    setStatsUsuario(null); // Limpiamos también las estadísticas privadas

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  };

  // Efecto que reacciona a los cambios en el token
  useEffect(() => {
    const cargarEstadisticas = async () => {
      setCargandoStats(true);
      try {
        // 1. Cargamos SIEMPRE las estadísticas generales (Landing Page)
        const generales = await statsService.obtenerGenerales();
        setStatsGenerales(generales);

        // 2. Cargamos las del usuario SOLO si inició sesión (Perfil)
        if (token) {
          const deUsuario = await statsService.obtenerUsuario(token);
          setStatsUsuario(deUsuario);
        } else {
          // Si cierra sesión o entra sin token, limpiamos sus datos privados
          setStatsUsuario(null);
        }
      } catch (error) {
        console.error("Error cargando estadísticas en AuthContext:", error);
        
        
        setStatsUsuario(null);

      } finally {
        setCargandoStats(false);
      }
    };

    cargarEstadisticas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // La dependencia [token] es clave para que actualice al hacer login/logout

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        role, 
        login, 
        updateUser,
        logout, 
        loading,
        statsGenerales,
        statsUsuario,
        cargandoStats
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);