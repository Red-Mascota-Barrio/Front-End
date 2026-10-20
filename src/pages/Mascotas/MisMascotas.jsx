import { AppNavbar } from '../../components/layout/AppNavbar';
import { Footer } from '../../components/layout/Footer';
import MisMascotas from '../../components/mascotas/MisMascotas';

// Página /mis-mascotas con navbar y footer
export const MisMascotasPage = () => (
  <div className="d-flex flex-column min-vh-100">
    <AppNavbar />
    <main className="flex-grow-1">
      <MisMascotas />
    </main>
    <Footer />
  </div>
);
