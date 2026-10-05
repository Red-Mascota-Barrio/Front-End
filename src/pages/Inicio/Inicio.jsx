import { AppNavbar } from '../../components/layout/AppNavbar';
import { Hero } from '../../components/home/Hero';
import { StatsSection } from '../../components/home/StatsSection';
import { ConsejosCarousel } from '../../components/home/ConsejosCarousel';
import { FeaturesSection } from '../../components/home/FeaturesSection';
import { Footer } from '../../components/layout/Footer';
import '../../assets/home.css';

export const Inicio = () => (
  <div className="inicio-page d-flex flex-column min-vh-100">
    <AppNavbar />
    <main>
      <Hero />
      <StatsSection />
      <ConsejosCarousel />
      <FeaturesSection />
    </main>
    <Footer />
  </div>
);
