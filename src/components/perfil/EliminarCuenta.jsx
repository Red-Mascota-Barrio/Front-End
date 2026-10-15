import { Button } from 'react-bootstrap';
import { FaTrashAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { perfilService } from '../../services/perfilService';
import { useAuth } from '../../context/AuthContext';
import { mensajeError } from '../../utils/perfil';

export const EliminarCuenta = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const confirmar = async () => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Eliminar tu cuenta?',
      html: 'Esta acción es <b>permanente</b>: perderás tu perfil, tus mascotas y tu actividad.<br/>Para confirmar, ingresa tu contraseña.',
      icon: 'warning',
      input: 'password',
      inputPlaceholder: 'Tu contraseña',
      inputAttributes: { autocapitalize: 'off', autocomplete: 'current-password' },
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar mi cuenta',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545',
      focusCancel: true,
      showLoaderOnConfirm: true,
      inputValidator: (valor) => (!valor ? 'Debes ingresar tu contraseña' : undefined),
      preConfirm: async (contrasena) => {
        try {
          await perfilService.eliminarCuenta(contrasena);
        } catch (error) {
          Swal.showValidationMessage(mensajeError(error, 'No se pudo eliminar la cuenta.'));
          return false;
        }
        return true;
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });

    if (isConfirmed) {
      await Swal.fire({ icon: 'success', title: 'Cuenta eliminada', text: 'Esperamos verte pronto de nuevo 🐾', timer: 2200, showConfirmButton: false });
      logout();
      navigate('/');
    }
  };

  return (
    <div className="p-4 border border-danger rounded-4 bg-white shadow-sm mt-4">
      <h5 className="fw-bold text-danger mb-2">Eliminar cuenta</h5>
      <p className="text-muted small mb-3">
        Al eliminar tu cuenta se borrarán tus datos de forma permanente. Esta acción no se puede deshacer.
      </p>
      <Button variant="outline-danger" onClick={confirmar} className="rounded-pill px-4 fw-medium">
        <FaTrashAlt className="me-2 mb-1" /> Eliminar mi cuenta
      </Button>
    </div>
  );
};