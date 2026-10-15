import { AppNavbar } from '../../components/layout/AppNavbar';
import { Footer } from '../../components/layout/Footer';
import { Mascotas } from '../../components/mascota/Mascotas';

export const MascotasPage = () => (
  <div className="d-flex flex-column min-vh-100">
    <AppNavbar />
    <main className="flex-grow-1">
      <Mascotas />
    </main>
    <Footer />
  </div>
);
