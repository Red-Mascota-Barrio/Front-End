import { useState } from 'react';
import { Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { perfilService } from '../../services/perfilService';
import { PasswordModal } from '../auth/PasswordMoldal';
import { mensajeError } from '../../utils/perfil';

const CampoClave = ({ id, etiqueta, registro, error, mostrar, onToggle }) => (
  <Form.Group className="mb-3" controlId={id}>
    <Form.Label className="small fw-bold text-muted">{etiqueta}</Form.Label>
    <InputGroup>
      <Form.Control type={mostrar ? 'text' : 'password'} {...registro} isInvalid={!!error} className="border-end-0 py-2 shadow-none" />
      <InputGroup.Text onClick={onToggle} className="bg-white border-start-0 text-muted" style={{ cursor: 'pointer' }}>
        {mostrar ? <FaEyeSlash /> : <FaEye />}
      </InputGroup.Text>
    </InputGroup>
    {error && <div className="text-danger small mt-1">{error.message}</div>}
  </Form.Group>
);

export const FormContrasena = () => {
  const [ver, setVer] = useState({ actual: false, nueva: false, confirmar: false });
  const [errorMsg, setErrorMsg] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [modal, setModal] = useState(false);

  const { register, handleSubmit, getValues, reset, formState: { errors } } = useForm();
  const toggle = (campo) => setVer((v) => ({ ...v, [campo]: !v[campo] }));

  const onSubmit = async (valores) => {
    try {
      setGuardando(true);
      setErrorMsg(null);
      await perfilService.cambiarContrasena({
        contrasena_actual: valores.actual,
        contrasena: valores.nueva,
        contrasena_confirmation: valores.confirmar,
      });
      reset();
      setModal(true);
    } catch (error) {
      setErrorMsg(mensajeError(error, 'No se pudo cambiar la contraseña.'));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)} noValidate className="p-4 bg-white rounded-4 shadow-sm border">
      <h5 className="fw-bold mb-4 text-dark">Cambiar contraseña</h5>
      {errorMsg && <Alert variant="danger" className="py-2 small rounded-3">{errorMsg}</Alert>}

      <CampoClave
        id="actual" etiqueta="CONTRASEÑA ACTUAL" mostrar={ver.actual} onToggle={() => toggle('actual')}
        registro={register('actual', { required: 'Ingresa tu contraseña actual' })} error={errors.actual}
      />
      <CampoClave
        id="nueva" etiqueta="NUEVA CONTRASEÑA" mostrar={ver.nueva} onToggle={() => toggle('nueva')}
        registro={register('nueva', {
          required: 'Ingresa la nueva contraseña',
          minLength: { value: 8, message: 'Mínimo 8 caracteres' },
          validate: (v) => v !== getValues('actual') || 'La nueva contraseña debe ser diferente a la actual',
        })}
        error={errors.nueva}
      />
      <CampoClave
        id="confirmar" etiqueta="CONFIRMAR NUEVA CONTRASEÑA" mostrar={ver.confirmar} onToggle={() => toggle('confirmar')}
        registro={register('confirmar', {
          required: 'Confirma la nueva contraseña',
          validate: (v) => v === getValues('nueva') || 'Las contraseñas no coinciden',
        })}
        error={errors.confirmar}
      />

      <div className="d-grid mt-4">
        <Button type="submit" variant="primary" className="rounded-pill py-2 shadow-sm fw-medium" disabled={guardando}>
          {guardando ? 'Actualizando...' : 'Actualizar contraseña'}
        </Button>
      </div>

      <PasswordModal show={modal} handleClose={() => setModal(false)} />
    </Form>
  );
};