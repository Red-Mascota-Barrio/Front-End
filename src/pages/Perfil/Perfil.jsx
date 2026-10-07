import { useEffect, useState } from 'react';
import { Container, Tabs, Tab, Spinner, Alert } from 'react-bootstrap';
import { FaPaw, FaComments, FaCalendarCheck } from 'react-icons/fa';
import { AppNavbar } from '../../components/layout/AppNavbar';
import { Footer } from '../../components/layout/Footer';
import { PerfilHeader } from '../../components/perfil/PerfilHeader';
import { TabMisMascotas } from '../../components/perfil/TabMisMascotas';
import { TabActividadForo } from '../../components/perfil/TabActividadForo';
import { TabEventos } from '../../components/perfil/TabEventos';
import { perfilService } from '../../services/perfilService';
import { useAuth } from '../../context/AuthContext';
import '../../assets/home.css';
import '../../assets/perfil.css';

export const Perfil = () => {
  const { user, updateUser } = useAuth();
  const [estadisticas, setEstadisticas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  // RF05: trae los datos actualizados del perfil y sus estadísticas
  useEffect(() => {
    perfilService
      .obtener()
      .then((data) => {
        const { estadisticas: stats, ...resto } = data?.usuario ?? data ?? {};
        setEstadisticas(data?.estadisticas ?? stats ?? null);
        if (resto && Object.keys(resto).length) updateUser(resto);
      })
      .catch(() => setError(true)) // si falla, se muestran los datos guardados en sesión
      .finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="inicio-page d-flex flex-column min-vh-100">
      <AppNavbar />
      <main className="flex-grow-1">
        {cargando ? (
          <div className="text-center py-5"><Spinner animation="border" className="perfil-spinner" /></div>
        ) : (
          <>
            {error && (
              <Container className="pt-3">
                <Alert variant="warning" className="small mb-0">
                  No se pudieron actualizar las estadísticas. Mostrando la información guardada.
                </Alert>
              </Container>
            )}
            <PerfilHeader usuario={user} estadisticas={estadisticas} />

            <Container className="perfil-contenido">
              <Tabs defaultActiveKey="mascotas" className="perfil-tabs mb-4" fill>
                <Tab eventKey="mascotas" title={<><FaPaw className="me-2" />Mis mascotas</>}>
                  <TabMisMascotas />
                </Tab>
                <Tab eventKey="foro" title={<><FaComments className="me-2" />Actividad en el foro</>} mountOnEnter>
                  <TabActividadForo />
                </Tab>
                <Tab eventKey="eventos" title={<><FaCalendarCheck className="me-2" />Eventos</>} mountOnEnter>
                  <TabEventos />
                </Tab>
              </Tabs>
            </Container>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};
