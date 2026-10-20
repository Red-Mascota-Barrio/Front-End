import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Icono } from '../common/Icono';
import logo from '../../assets/images/inicio/logo.png';

export const Footer = () => {
  const { token, user } = useAuth();
  const haySesion = Boolean(token && user);

  return (
    <footer className="app-footer">
      <Container>
        <Row className="g-4 g-lg-5">
          <Col lg={5} className="footer-marca">
            <h3 className="d-flex align-items-center gap-2">
              <img src={logo} alt="" width="32" height="32" className="rounded-circle bg-white" />
              Red de Mascotas de Barrio
            </h3>
            <p>
              Conectamos personas, mascotas y comunidades para construir un barrio más amigable con
              los animales.
            </p>
            <p className="footer-contacto">
              <Icono nombre="envelope" /> soporte@reddemascotas.com · <Icono nombre="geo-alt" /> Bucaramanga, Colombia
            </p>
          </Col>

          <Col xs={6} md={4} lg={2} className="footer-col">
            <h4>Plataforma</h4>
            <Link to="/mascotas">Adoptar</Link>
            <Link to="/foro">Foros</Link>
            <Link to="/eventos">Eventos</Link>
          </Col>

          <Col xs={6} md={4} lg={2} className="footer-col">
            <h4>Cuenta</h4>
            {haySesion ? (
              <>
                <Link to="/perfil">Mi perfil</Link>
                <Link to="/mis-mascotas">Mis mascotas</Link>
                <Link to="/perfil/editar">Configuración</Link>
              </>
            ) : (
              <>
                <Link to="/login">Iniciar sesión</Link>
                <Link to="/registro">Registrarse</Link>
                <Link to="/recuperar">Recuperar contraseña</Link>
              </>
            )}
          </Col>

          <Col md={4} lg={3} className="footer-col">
            <h4>Legal</h4>
            <a href="#terminos">Términos y condiciones</a>
            <a href="#privacidad">Política de privacidad</a>
            <a href="#bienestar">Bienestar animal</a>
          </Col>
        </Row>

        <div className="footer-fondo d-flex flex-column flex-sm-row justify-content-between gap-2">
          <span>© {new Date().getFullYear()} Red de Mascotas de Barrio</span>
          <span>Hecho con <Icono nombre="heart-fill" /> para los animales de Colombia</span>
        </div>
      </Container>
    </footer>
  );
};
