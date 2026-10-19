import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Icono } from '../common/Icono';
import { PERFIL_SOPORTA } from '../../services/perfilService';

// El back no tiene todavía GET de "mis mascotas" (PERFIL_SOPORTA.misMascotas = false),
// así que aquí se muestra el total de /estadisticas/usuario y los accesos directos.
export const TabMisMascotas = ({ cantidad = 0 }) => (
  <div className="perfil-tab-vacio">
    <div className="perfil-tab-vacio-icono"><Icono nombre="heart" /></div>
    <p className="perfil-tab-vacio-titulo">
      {cantidad ? `Tienes ${cantidad} ${Number(cantidad) === 1 ? 'mascota registrada' : 'mascotas registradas'}` : 'Aún no has registrado mascotas'}
    </p>
    <p className="perfil-tab-vacio-sub">
      Registra a tu mascota para publicarla en adopción o llevar su información al día.
      {!PERFIL_SOPORTA.misMascotas && ' (El listado individual estará disponible cuando la API exponga tus mascotas.)'}
    </p>
    <div className="d-flex justify-content-center flex-wrap gap-2">
      <Button as={Link} to="/mis-mascotas?registrar=1" variant="primary">
        <Icono nombre="plus-lg" /> Registrar mascota
      </Button>
      <Button as={Link} to="/mascotas" variant="outline-primary">Ver catálogo</Button>
    </div>
  </div>
);
