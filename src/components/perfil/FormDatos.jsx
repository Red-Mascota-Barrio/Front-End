import { useState } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { perfilService } from '../../services/perfilService';
import { useAuth } from '../../context/AuthContext';
import { mensajeError } from '../../utils/perfil';
import { FotoPerfilUploader } from './FotoPerfilUploader';

export const FormDatos = () => {
  const { user, updateUser } = useAuth();
  const [mensaje, setMensaje] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const { register, handleSubmit, formState: { errors, isDirty }, reset } = useForm({
    defaultValues: {
      nombre: user?.nombre ?? '',
      apellido: user?.apellido ?? '',
      telefono: user?.telefono ?? '',
      barrio: user?.barrio ?? '',
      biografia: user?.biografia ?? '',
    },
  });

  const onSubmit = async (valores) => {
    try {
      setGuardando(true);
      setMensaje(null);
      const data = await perfilService.actualizar(valores);
      const actualizado = data?.usuario ?? data?.user ?? valores;
      updateUser(actualizado);
      reset(valores);
      setMensaje({ tipo: 'success', texto: 'Tus datos se guardaron correctamente.' });
    } catch (error) {
      setMensaje({ tipo: 'danger', texto: mensajeError(error, 'No se pudieron guardar los cambios.') });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <FotoPerfilUploader />
      <Form onSubmit={handleSubmit(onSubmit)} noValidate>
        {mensaje && <Alert variant={mensaje.tipo} className="py-2 small">{mensaje.texto}</Alert>}

        <Row className="g-3">
          <Col md={6}>
            <Form.Group controlId="nombre">
              <Form.Label className="small fw-bold text-muted input-label">NOMBRE</Form.Label>
              <Form.Control
                {...register('nombre', { required: 'El nombre es obligatorio', maxLength: { value: 60, message: 'Máximo 60 caracteres' } })}
                isInvalid={!!errors.nombre}
              />
              <Form.Control.Feedback type="invalid">{errors.nombre?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="apellido">
              <Form.Label className="small fw-bold text-muted input-label">APELLIDO</Form.Label>
              <Form.Control
                {...register('apellido', { required: 'El apellido es obligatorio', maxLength: { value: 60, message: 'Máximo 60 caracteres' } })}
                isInvalid={!!errors.apellido}
              />
              <Form.Control.Feedback type="invalid">{errors.apellido?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="correo">
              <Form.Label className="small fw-bold text-muted input-label">CORREO ELECTRÓNICO</Form.Label>
              <Form.Control value={user?.correo ?? ''} disabled readOnly />
              <Form.Text className="text-muted">El correo no se puede modificar.</Form.Text>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="telefono">
              <Form.Label className="small fw-bold text-muted input-label">TELÉFONO</Form.Label>
              <Form.Control
                type="tel"
                {...register('telefono', { pattern: { value: /^[0-9+\s-]{7,15}$/, message: 'Teléfono no válido' } })}
                isInvalid={!!errors.telefono}
              />
              <Form.Control.Feedback type="invalid">{errors.telefono?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col xs={12}>
            <Form.Group controlId="barrio">
              <Form.Label className="small fw-bold text-muted input-label">BARRIO</Form.Label>
              <Form.Control {...register('barrio')} />
            </Form.Group>
          </Col>
          <Col xs={12}>
            <Form.Group controlId="biografia">
              <Form.Label className="small fw-bold text-muted input-label">SOBRE MÍ</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                {...register('biografia', { maxLength: { value: 250, message: 'Máximo 250 caracteres' } })}
                isInvalid={!!errors.biografia}
              />
              <Form.Control.Feedback type="invalid">{errors.biografia?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Button type="submit" className="btn-cta mt-4" disabled={guardando || !isDirty}>
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </Form>
    </>
  );
};
