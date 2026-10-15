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
    <div className="p-4 bg-white rounded-4 shadow-sm border">
      <h5 className="fw-bold mb-4 text-dark">Información personal</h5>
      <div className="mb-4 text-center">
        <FotoPerfilUploader />
      </div>
      
      <Form onSubmit={handleSubmit(onSubmit)} noValidate>
        {mensaje && <Alert variant={mensaje.tipo} className="py-2 small rounded-3">{mensaje.texto}</Alert>}

        <Row className="g-3">
          <Col md={6}>
            <Form.Group controlId="nombre">
              <Form.Label className="small fw-bold text-muted">NOMBRE</Form.Label>
              <Form.Control
                className="py-2 shadow-none"
                {...register('nombre', { required: 'El nombre es obligatorio', maxLength: { value: 60, message: 'Máximo 60 caracteres' } })}
                isInvalid={!!errors.nombre}
              />
              <Form.Control.Feedback type="invalid">{errors.nombre?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="apellido">
              <Form.Label className="small fw-bold text-muted">APELLIDO</Form.Label>
              <Form.Control
                className="py-2 shadow-none"
                {...register('apellido', { required: 'El apellido es obligatorio', maxLength: { value: 60, message: 'Máximo 60 caracteres' } })}
                isInvalid={!!errors.apellido}
              />
              <Form.Control.Feedback type="invalid">{errors.apellido?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="correo">
              <Form.Label className="small fw-bold text-muted">CORREO ELECTRÓNICO</Form.Label>
              <Form.Control className="py-2 shadow-none bg-light" value={user?.correo ?? ''} disabled readOnly />
              <Form.Text className="text-muted">El correo no se puede modificar.</Form.Text>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="telefono">
              <Form.Label className="small fw-bold text-muted">TELÉFONO</Form.Label>
              <Form.Control
                type="tel"
                className="py-2 shadow-none"
                {...register('telefono', { pattern: { value: /^[0-9+\s-]{7,15}$/, message: 'Teléfono no válido' } })}
                isInvalid={!!errors.telefono}
              />
              <Form.Control.Feedback type="invalid">{errors.telefono?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col xs={12}>
            <Form.Group controlId="barrio">
              <Form.Label className="small fw-bold text-muted">BARRIO</Form.Label>
              <Form.Control className="py-2 shadow-none" {...register('barrio')} />
            </Form.Group>
          </Col>
          <Col xs={12}>
            <Form.Group controlId="biografia">
              <Form.Label className="small fw-bold text-muted">SOBRE MÍ</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                className="shadow-none"
                {...register('biografia', { maxLength: { value: 250, message: 'Máximo 250 caracteres' } })}
                isInvalid={!!errors.biografia}
              />
              <Form.Control.Feedback type="invalid">{errors.biografia?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <div className="d-grid mt-4">
          <Button type="submit" variant="primary" className="rounded-pill py-2 shadow-sm fw-medium" disabled={guardando || !isDirty}>
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </Form>
    </div>
  );
};