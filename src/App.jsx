import { useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import { AppRouter } from './routes/AppRouter';
import { AuthProvider } from './context/AuthContext';

function App() {
  useEffect(() => {
    // Si Google OAuth o el backend redirigen con ?token= o ?error= en la query principal de la URL,
    // transferirlo hacia el hash para que HashRouter y el componente de Login lo lean directamente.
    const search = window.location.search;
    if (search && (search.includes('token=') || search.includes('error='))) {
      const limpio = search.replace(/^\?/, '');
      if (!window.location.hash.includes('token=') && !window.location.hash.includes('error=')) {
        window.location.hash = `#/login?${limpio}`;
      }
    }
  }, []);

  return (
    <HashRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
