import { Modal, Button } from 'react-bootstrap';
import { Icono } from '../common/Icono';

export const PasswordModal = ({ show, handleClose }) => (
  <Modal show={show} onHide={handleClose} centered size="sm">
    <Modal.Body className="text-center p-4">
      <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-verde-fondo text-verde-oscuro fs-3 mb-3" style={{ width: 64, height: 64 }}>
        <Icono nombre="check-lg" />
      </div>
      <h2 className="h5 fw-bold text-verde-oscuro">¡Contraseña actualizada!</h2>
      <p className="text-muted small mb-4">Ya puedes usar tu nueva contraseña.</p>
      <Button variant="primary" className="w-100" onClick={handleClose}>
        Aceptar
      </Button>
    </Modal.Body>
  </Modal>
);
