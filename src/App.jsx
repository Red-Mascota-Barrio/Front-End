import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './routes/AppRouter';
import { AuthProvider } from './context/AuthContext';
import Mascotas from './components/Mascotas';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

