import { AppNavbar } from '../../components/layout/AppNavbar';
import { Footer } from '../../components/layout/Footer';
import Eventos from '../../components/eventos/Eventos';
import '../../styles/home.css';

export const EventosPage = () => (
  <div className="d-flex flex-column min-vh-100">
    <AppNavbar />
    <main className="flex-grow-1">
      <Eventos />
    </main>
    <Footer />
  </div>
);

export { EventosPage as Eventos };
