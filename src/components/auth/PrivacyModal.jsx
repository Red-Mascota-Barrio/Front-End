import { Button, Modal } from 'react-bootstrap';
import { FaUserShield } from 'react-icons/fa';

export const PrivacyModal = ({ show, handleClose }) => (
  <Modal show={show} onHide={handleClose} centered size="lg" aria-labelledby="privacidad-titulo">
    <Modal.Header closeButton>
      <Modal.Title id="privacidad-titulo" className="d-flex align-items-center gap-2">
        <FaUserShield /> Política de privacidad y tratamiento de datos
      </Modal.Title>
    </Modal.Header>
    <Modal.Body className="px-4 py-3" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
      <p className="text-muted small">Última actualización: noviembre de 2026</p>
      <h6 className="fw-bold mt-3">Responsable y datos recopilados</h6>
      <p className="small text-muted">
        Red de Mascotas de Barrio trata los datos que proporcionas al crear tu cuenta, como nombre,
        correo y teléfono opcional, además del contenido que publiques en la plataforma.
      </p>
      <h6 className="fw-bold mt-3">Finalidad y conservación</h6>
      <p className="small text-muted">
        Usamos estos datos para administrar tu cuenta, verificar tu correo, facilitar adopciones y
        eventos, y enviarte avisos relacionados con tu actividad. Los conservamos mientras la cuenta
        esté activa o cuando sea necesario para atender obligaciones legales.
      </p>
      <h6 className="fw-bold mt-3">Tus derechos</h6>
      <p className="small text-muted">
        Puedes solicitar consulta, corrección o eliminación de tus datos y retirar tu autorización
        desde la configuración de la cuenta o escribiendo a{' '}
        <a href="mailto:soporte@reddemascotas.com">soporte@reddemascotas.com</a>.
      </p>
      <p className="small text-muted mb-0">
        Al marcar la casilla confirmas que leíste esta política y autorizas el tratamiento descrito.
      </p>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="primary" onClick={handleClose}>Entendido</Button>
    </Modal.Footer>
  </Modal>
);
