import { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { compartidosService, mensajeDeError } from '../../services/compartidosService';

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Pide el correo de la persona con quien se va a compartir la mascota.
// Le llegará una notificación para aceptar o rechazar; si acepta, solo podrá verla en su perfil.
export default function CompartirMascotaModal({ mascota, onClose, onCompartida }) {
  const [correo, setCorreo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const mascotaId = mascota?.id_mascotas ?? mascota?.id;

  const enviar = async (e) => {
    e.preventDefault();
    if (enviando || exito) return;

    if (!CORREO_VALIDO.test(correo.trim())) {
      setError('Escribe un correo válido.');
      return;
    }

    setEnviando(true);
    setError('');
    try {
      const respuesta = await compartidosService.compartir(mascotaId, correo);
      setExito(respuesta?.mensaje || 'Invitación enviada.');
      onCompartida?.(respuesta?.datos);
    } catch (err) {
      console.error('Error al compartir la mascota:', err);
      setError(mensajeDeError(err, 'No se pudo compartir la mascota. Intenta de nuevo.'));
    } finally {
      setEnviando(false);
    }
  };

  const cerrar = () => {
    if (!enviando) onClose();
  };

  return (
    <Modal
      show
      onHide={cerrar}
      centered
      backdrop={enviando ? 'static' : true}
      keyboard={!enviando}
      aria-labelledby="compartir-mascota-titulo"
    >
      <Form onSubmit={enviar} noValidate>
        <Modal.Header closeButton={!enviando} className="border-0 pb-0">
          <Modal.Title id="compartir-mascota-titulo" className="h4">
            Compartir a {mascota?.nombre}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="px-4">
          {exito ? (
            <Alert variant="success" className="mb-0">{exito}</Alert>
          ) : (
            <>
              <p className="text-secondary">
                Escribe el correo de la persona con quien quieres compartir a {mascota?.nombre}.
                Le llegará una notificación para aceptar o rechazar. Si acepta, podrá ver la mascota en
                su perfil, pero no podrá editarla, publicarla en adopción ni eliminarla.
              </p>
              <Form.Group controlId="compartir-correo">
                <Form.Label>Correo de la persona</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={correo}
                  onChange={(e) => { setCorreo(e.target.value); setError(''); }}
                  disabled={enviando}
                  autoFocus
                  autoComplete="off"
                  isInvalid={Boolean(error)}
                />
                <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
              </Form.Group>
            </>
          )}
        </Modal.Body>

        <Modal.Footer className="justify-content-center border-0 pt-0">
          {exito ? (
            <Button variant="success" onClick={onClose}>Listo</Button>
          ) : (
            <>
              <Button variant="outline-secondary" onClick={cerrar} disabled={enviando}>
                Cancelar
              </Button>
              <Button type="submit" variant="success" disabled={enviando || !correo.trim()}>
                {enviando ? (
                  <>
                    <Spinner animation="border" size="sm" aria-hidden="true" /> Enviando…
                  </>
                ) : 'Compartir mascota'}
              </Button>
            </>
          )}
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
