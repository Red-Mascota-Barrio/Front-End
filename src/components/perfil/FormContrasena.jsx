import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Icono } from '../common/Icono';
import { useAuth } from '../../context/AuthContext';

/*
 * El back no tiene una ruta para cambiar la contraseña con la actual
 * (perfilService.cambiarContrasena / PERFIL_SOPORTA.contrasena = false).
 * Sí existe el flujo por código OTP: POST /recuperar/solicitar + /recuperar/restablecer,
 * así que se ofrece ese camino. Ojo: al restablecer, el back cierra todas las sesiones.
 */
export const FormContrasena = () => {
  const { user } = useAuth();

  return (
    <section className="perfil-seccion">
      <div className="perfil-seccion-header">
        <h2>Contraseña</h2>
        <p>Te enviaremos un código a {user?.correo ?? 'tu correo'} para crear una nueva.</p>
      </div>
      <div className="perfil-seccion-body d-flex flex-wrap align-items-center justify-content-between gap-3">
        <p className="small text-muted mb-0" style={{ maxWidth: 460 }}>
          Por seguridad, al cambiar la contraseña se cerrará tu sesión en todos los dispositivos y
          tendrás que volver a iniciar sesión.
        </p>
        <Button as={Link} to="/recuperar" variant="outline-primary">
          <Icono nombre="key" /> Cambiar contraseña
        </Button>
      </div>
    </section>
  );
};
