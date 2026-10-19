import { useState } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { perfilService } from '../../services/perfilService';
import { useAuth } from '../../context/AuthContext';
import { mensajeError } from '../../utils/perfil';
import { FotoPerfilUploader } from './FotoPerfilUploader';

// Campos que acepta PUT /usuarios/{id} (UsuarioController@update)
const valoresIniciales = (u) => ({
  nombre: u?.nombre ?? '',
  apellido: u?.apellido ?? '',
  telefono: u?.telefono ?? '',
  barrio: u?.barrio ?? '',
  ciudad: u?.ciudad ?? '',
  descripcion: u?.descripcion ?? u?.biografia ?? '',
});

export const FormDatos = () => {
  const { user, updateUser } = useAuth();
  const [mensaje, setMensaje] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const { register, handleSubmit, formState: { errors, isDirty }, reset } = useForm({
    defaultValues: valoresIniciales(user),
  });

  const onSubmit = async (valores) => {
    try {
      setGuardando(true);
      setMensaje(null);
      const actualizado = await perfilService.actualizar(user.id_usuario, valores);
      updateUser(actualizado && typeof actualizado === 'object' ? actualizado : valores);
      reset(valores);
      setMensaje({ tipo: 'success', texto: 'Tus datos se guardaron correctamente.' });
    } catch (error) {
      setMensaje({ tipo: 'danger', texto: mensajeError(error, 'No se pudieron guardar los cambios.') });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="perfil-seccion">
      <div className="perfil-seccion-header">
        <h2>Información personal</h2>
        <p>Así te verán los demás miembros de la comunidad.</p>
      </div>
      <div className="perfil-seccion-body">
        <FotoPerfilUploader />

        <Form onSubmit={handleSubmit(onSubmit)} noValidate>
          {mensaje && <Alert variant={mensaje.tipo}>{mensaje.texto}</Alert>}

          <Row className="g-3">
            <Col md={6}>
              <Form.Group controlId="nombre">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  {...register('nombre', { required: 'El nombre es obligatorio', maxLength: { value: 255, message: 'Demasiado largo' } })}
                  isInvalid={!!errors.nombre}
                />
                <Form.Control.Feedback type="invalid">{errors.nombre?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="apellido">
                <Form.Label>Apellido</Form.Label>
                <Form.Control
                  {...register('apellido', { required: 'El apellido es obligatorio', maxLength: { value: 255, message: 'Demasiado largo' } })}
                  isInvalid={!!errors.apellido}
                />
                <Form.Control.Feedback type="invalid">{errors.apellido?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="correo">
                <Form.Label>Correo electrónico</Form.Label>
                <Form.Control value={user?.correo ?? ''} disabled readOnly />
                <Form.Text>El correo no se puede modificar.</Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="telefono">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  type="tel"
                  {...register('telefono', {
                    maxLength: { value: 20, message: 'Máximo 20 caracteres' },
                    pattern: { value: /^[0-9+\s-]{7,20}$/, message: 'Teléfono no válido' },
                  })}
                  isInvalid={!!errors.telefono}
                />
                <Form.Control.Feedback type="invalid">{errors.telefono?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="barrio">
                <Form.Label>Barrio</Form.Label>
                <Form.Control {...register('barrio', { maxLength: { value: 100, message: 'Máximo 100 caracteres' } })} isInvalid={!!errors.barrio} />
                <Form.Control.Feedback type="invalid">{errors.barrio?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="ciudad">
                <Form.Label>Ciudad</Form.Label>
                <Form.Control {...register('ciudad', { maxLength: { value: 100, message: 'Máximo 100 caracteres' } })} isInvalid={!!errors.ciudad} />
                <Form.Control.Feedback type="invalid">{errors.ciudad?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group controlId="descripcion">
                <Form.Label>Sobre mí</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  {...register('descripcion', { maxLength: { value: 250, message: 'Máximo 250 caracteres' } })}
                  isInvalid={!!errors.descripcion}
                />
                <Form.Control.Feedback type="invalid">{errors.descripcion?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button type="button" variant="light" onClick={() => reset()} disabled={guardando || !isDirty}>
              Descartar
            </Button>
            <Button type="submit" variant="primary" disabled={guardando || !isDirty}>
              {guardando ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </div>
        </Form>
      </div>
    </section>
  );
};
