import { Modal, Button } from 'react-bootstrap';
import { fechaCorta } from '../../utils/admin';
import { Icono } from '../common/Icono';

export default function InscripcionModal({ evento, onClose, onConfirmar, enviando = false }) {
  return (
    <Modal show={Boolean(evento)} onHide={onClose} centered backdrop="static">
      <Modal.Header closeButton={!enviando}>
        <div>
          <Modal.Title as="h2" className="h5 mb-1">Confirmar inscripción</Modal.Title>
          <p className="text-muted small mb-0">{evento?.titulo}</p>
        </div>
      </Modal.Header>

      <Modal.Body>
        <div className="caja-info d-flex flex-column gap-1">
          <div><Icono nombre="calendar-event" /> <strong>Fecha:</strong> {fechaCorta(evento?.fecha)}</div>
          {evento?.hora && <div><Icono nombre="clock" /> <strong>Hora:</strong> {evento.hora}</div>}
          <div><Icono nombre="geo-alt" /> <strong>Lugar:</strong> {evento?.lugar}</div>
        </div>
        <p className="text-muted small mt-3 mb-0">
          Te avisaremos si hay cambios en el evento. Puedes ver tus inscripciones en tu perfil.
        </p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="light" onClick={onClose} disabled={enviando}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={() => onConfirmar(evento.id)} disabled={enviando}>
          {enviando ? 'Inscribiendo…' : 'Confirmar asistencia'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
