import { Modal, Button } from 'react-bootstrap';
import { FaFileContract } from 'react-icons/fa';

export const TermsModal = ({ show, handleClose }) => {
  return (
    <Modal show={show} onHide={handleClose} centered size="lg" scrollable aria-labelledby="terminos-titulo">
      <Modal.Header closeButton className="documento-modal-header">
        <Modal.Title id="terminos-titulo" className="d-flex align-items-center gap-2">
          <span className="documento-modal-icono"><FaFileContract /></span>
          <span>Términos y condiciones</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="documento-modal-cuerpo">
        <div className="documento-modal-intro">
          <span className="badge badge-verde">Red de Mascotas de Barrio</span>
          <p className="small text-secondary mb-0 mt-2">Última actualización: noviembre de 2026</p>
        </div>

        <section className="documento-seccion">
          <span className="documento-seccion-numero">01</span>
          <div><h3>Aceptación y cuenta</h3><p>Al crear una cuenta aceptas estas condiciones. Debes proporcionar información correcta, mantenerla actualizada y cuidar tus credenciales de acceso.</p></div>
        </section>
        <section className="documento-seccion">
          <span className="documento-seccion-numero">02</span>
          <div><h3>Uso de la comunidad</h3><p>La plataforma facilita la publicación de mascotas, solicitudes de adopción, eventos y conversaciones comunitarias. No garantiza que una adopción o contacto llegue a concretarse; las personas usuarias deben verificar la información y coordinar de forma responsable.</p></div>
        </section>
        <section className="documento-seccion">
          <span className="documento-seccion-numero">03</span>
          <div><h3>Contenido y convivencia</h3><p>Publica información respetuosa y relacionada con la comunidad. No se permite contenido ilegal, engañoso, acosador ni que ponga en riesgo a personas o animales. El contenido puede reportarse y ser revisado por el equipo administrador.</p></div>
        </section>
        <section className="documento-seccion">
          <span className="documento-seccion-numero">04</span>
          <div><h3>Privacidad</h3><p>El uso de datos personales se explica en la Política de privacidad, que se acepta por separado durante el registro. Solo comparte información de contacto cuando sea necesario para coordinar una actividad o adopción.</p></div>
        </section>
        <section className="documento-seccion">
          <span className="documento-seccion-numero">05</span>
          <div><h3>Disponibilidad y cambios</h3><p>Podemos actualizar o limitar funciones para mantener la seguridad y el funcionamiento del servicio. Publicaremos los cambios en esta sección; el uso posterior implica aceptar la versión vigente.</p></div>
        </section>
        <div className="documento-modal-nota">
          Al cerrar esta ventana no aceptas automáticamente: marca la casilla correspondiente en el formulario si estás de acuerdo.
        </div>
      </Modal.Body>

      <Modal.Footer className="documento-modal-footer">
        <Button variant="outline-secondary" onClick={handleClose}>Volver al registro</Button>
      </Modal.Footer>
    </Modal>
  );
};
