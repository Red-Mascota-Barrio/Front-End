import { Modal } from 'react-bootstrap'; // Asegúrate de importar Button

export const PasswordModal = ({ show, handleClose }) => {
  return (
    <Modal show={show} onHide={handleClose} centered size="sm">
      <Modal.Body className="px-4 py-3 text-center" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        <p>¡Has actualizado tu contraseña con éxito!</p>
      </Modal.Body>
    </Modal>
  );
};