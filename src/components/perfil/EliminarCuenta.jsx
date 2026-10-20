import { Button } from 'react-bootstrap';
import { Icono } from '../common/Icono';
import { PERFIL_SOPORTA } from '../../services/perfilService';

// DELETE /usuarios/{id} es exclusivo del administrador; el usuario no puede borrar su cuenta
// desde la API todavía (PERFIL_SOPORTA.eliminarCuenta = false).
export const EliminarCuenta = () => (
  <div className="zona-peligro">
    <div>
      <h3>Eliminar cuenta</h3>
      <p>
        {PERFIL_SOPORTA.eliminarCuenta
          ? 'Se borrarán tus datos de forma permanente. Esta acción no se puede deshacer.'
          : 'Para eliminar tu cuenta escribe a soporte@reddemascotas.com y un administrador lo hará por ti.'}
      </p>
    </div>
    <Button
      variant="outline-danger"
      href="mailto:soporte@reddemascotas.com?subject=Eliminar%20mi%20cuenta"
    >
      <Icono nombre="envelope" /> Solicitar eliminación
    </Button>
  </div>
);
