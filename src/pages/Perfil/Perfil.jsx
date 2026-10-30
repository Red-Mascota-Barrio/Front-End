import { useEffect, useState } from 'react';
import { Container, Tabs, Tab, Spinner, Alert } from 'react-bootstrap';
import { AppNavbar } from '../../components/layout/AppNavbar';
import { Footer } from '../../components/layout/Footer';
import { Icono } from '../../components/common/Icono';
import { PerfilHeader } from '../../components/perfil/PerfilHeader';
import { TabMisMascotas } from '../../components/perfil/TabMisMascotas';
import { TabActividadForo } from '../../components/perfil/TabActividadForo';
import { TabEventos } from '../../components/perfil/TabEventos';
import { perfilService } from '../../services/perfilService';
import { useAuth } from '../../context/AuthContext';
import '../../styles/perfil.css';

const Titulo = ({ icono, children }) => (
  <>
    <Icono nombre={icono} className="me-2" />
    {children}
  </>
);

export const Perfil = () => {
  const { user, updateUser, statsUsuario } = useAuth();
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  // RF05: refresca los datos del usuario con GET /user. Las cifras vienen de
  // GET /estadisticas/usuario, que ya carga AuthContext (statsUsuario).
  useEffect(() => {
    perfilService
      .obtener()
      .then((data) => data && updateUser(data))
      .catch(() => setError(true)) // si falla, se muestran los datos guardados en sesión
      .finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="d-flex flex-column min-vh-100">
      <AppNavbar />
      <main className="flex-grow-1">
        <Container className="perfil-main">
          {cargando ? (
            <div className="text-center py-5"><Spinner animation="border" role="status" /></div>
          ) : (
            <>
              {error && (
                <Alert variant="warning">
                  <Icono nombre="exclamation-triangle" /> No se pudieron actualizar los datos del perfil. Mostrando la información guardada.
                </Alert>
              )}
              <PerfilHeader usuario={user} estadisticas={statsUsuario} />

              <Tabs defaultActiveKey="mascotas" className="perfil-tabs" id="pestanas-perfil">
                <Tab eventKey="mascotas" title={<Titulo icono="heart">Mis mascotas</Titulo>}>
                  <TabMisMascotas />
                </Tab>
                <Tab eventKey="foro" title={<Titulo icono="chat-left-text">Mis publicaciones</Titulo>} mountOnEnter>
                  <TabActividadForo idUsuario={user?.id_usuario} />
                </Tab>
                <Tab eventKey="eventos" title={<Titulo icono="calendar-event">Eventos</Titulo>} mountOnEnter>
                  <TabEventos />
                </Tab>
              </Tabs>
            </>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
};
