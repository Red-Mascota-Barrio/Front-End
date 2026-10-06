import { createContext, useContext, useState, useEffect } from 'react';

// Creamos el contexto
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [role, setRole] = useState(localStorage.getItem('role') || null);
  const [loading, setLoading] = useState(true);

  // Al cargar la app, validamos si hay sesión guardada
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('role');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setRole(storedRole);
    }
    setLoading(false);
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

  // Actualiza los datos del usuario en sesión (ej. tras editar el perfil)
  const updateUser = (cambios) => {
    setUser((previo) => {
      const actualizado = { ...previo, ...cambios };
      localStorage.setItem('user', JSON.stringify(actualizado));
      return actualizado;
    });
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
    <AuthContext.Provider value={{ user, token, role, login, logout, updateUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto fácilmente
export const useAuth = () => useContext(AuthContext);