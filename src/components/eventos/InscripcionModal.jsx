import { Modal, Button } from 'react-bootstrap';

export default function InscripcionModal({ evento, onClose, onConfirmar, enviando = false }) {
  return (
    <Modal show={Boolean(evento)} onHide={onClose} centered backdrop="static">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">Confirmar inscripción</Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="pt-3">
        <p className="text-secondary mb-3">
          ¿Deseas inscribirte al evento <strong className="text-dark">{evento?.titulo}</strong>?
        </p>
        
        <div className="bg-light p-3 rounded-3 small text-secondary">
          <div className="mb-1">📅 <strong>Fecha:</strong> {evento?.fecha}</div>
          <div className="mb-1">🕒 <strong>Hora:</strong> {evento?.hora}</div>
          <div>📍 <strong>Lugar:</strong> {evento?.lugar}</div>
        </div>
      </Modal.Body>
      
      <Modal.Footer className="border-0 pt-0">
        <Button 
          variant="light" 
          className="rounded-pill px-4 text-secondary border" 
          onClick={onClose} 
          disabled={enviando}
        >
          Cancelar
        </Button>
        
        <Button 
          variant="success" 
          className="rounded-pill px-4 shadow-sm fw-medium" 
          onClick={() => onConfirmar(evento.id)} 
          disabled={enviando}
        >
          {enviando ? 'Inscribiendo...' : 'Confirmar asistencia'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}