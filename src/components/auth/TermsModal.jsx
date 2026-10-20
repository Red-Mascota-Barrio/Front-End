import { Modal, Button } from 'react-bootstrap';
import { FaFileContract } from 'react-icons/fa';

export const TermsModal = ({ show, handleClose }) => {
  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton className="border-bottom-0 pb-0">
        <Modal.Title className="d-flex align-items-center gap-2">
          <FaFileContract /> Términos y Condiciones de Uso
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="px-4 py-3" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        <p className="text-muted small">Última actualización: Septiembre de 2026</p>
        
        <h6 className="fw-bold text-dark mt-3">1. Aceptación de los Términos</h6>
        <p className="small text-muted">
          Al registrarte y utilizar la plataforma <strong>Red de Mascotas de Barrio</strong>, aceptas cumplir y quedar obligado por los presentes Términos y Condiciones. Si no estás de acuerdo con alguna de las disposiciones, te sugerimos no hacer uso del servicio.
        </p>

        <h6 className="fw-bold text-dark mt-3">2. Registro de Usuario y Seguridad</h6>
        <p className="small text-muted">
          Te comprometes a proporcionar información verídica, exacta y actualizada durante el proceso de registro en 3 pasos. Eres el único responsable de mantener la confidencialidad de tu contraseña y de todas las actividades que ocurran bajo tu cuenta.
        </p>

        <h6 className="fw-bold text-dark mt-3">3. Uso Adecuado de la Plataforma</h6>
        <p className="small text-muted">
          La plataforma está diseñada para la gestión de adopciones, reporte de mascotas perdidas, eventos y participación en foros comunitarios. Queda estrictamente prohibido publicar contenido ofensivo, fraudulento o que atente contra el bienestar animal y la convivencia vecinal.
        </p>

        <h6 className="fw-bold text-dark mt-3">4. Privacidad y Protección de Datos</h6>
        <p className="small text-muted">
          Tus datos personales recopilados (nombre, correo electrónico) serán tratados con estricta confidencialidad de acuerdo con las normativas vigentes, utilizándose exclusivamente para la gestión interna de tu cuenta dentro de la red comunitaria.
        </p>

        <h6 className="fw-bold text-dark mt-3">5. Modificaciones</h6>
        <p className="small text-muted">
          Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en la plataforma.
        </p>
      </Modal.Body>

      <Modal.Footer className="border-top-0 pt-0">
        <Button variant="primary" onClick={handleClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};