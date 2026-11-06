import { Button, Modal } from 'react-bootstrap';
import { FaUserShield } from 'react-icons/fa';

export const PrivacyModal = ({ show, handleClose }) => (
  <Modal show={show} onHide={handleClose} centered size="lg" scrollable aria-labelledby="privacidad-titulo">
    <Modal.Header closeButton className="documento-modal-header">
      <Modal.Title id="privacidad-titulo" className="d-flex align-items-center gap-2">
        <span className="documento-modal-icono"><FaUserShield /></span>
        <span>Privacidad y tratamiento de datos</span>
      </Modal.Title>
    </Modal.Header>
    <Modal.Body className="documento-modal-cuerpo">
      <div className="documento-modal-intro">
        <span className="badge badge-verde">Tus datos, bajo tu control</span>
        <p className="small text-secondary mb-0 mt-2">Última actualización: noviembre de 2026</p>
      </div>
      <section className="documento-seccion">
        <span className="documento-seccion-numero"><i className="bi bi-person-vcard" /></span>
        <div><h3>Quién y qué información</h3><p>Red de Mascotas de Barrio administra los datos que proporcionas: nombre, correo, teléfono opcional, información de tus mascotas, publicaciones y solicitudes que envías.</p></div>
      </section>
      <section className="documento-seccion">
        <span className="documento-seccion-numero"><i className="bi bi-bullseye" /></span>
        <div><h3>Para qué los usamos</h3><p>Usamos la información para crear y proteger tu cuenta, verificar tu correo, gestionar adopciones, compartir mascotas cuando lo solicitas, mostrar eventos, moderar reportes y enviar avisos relacionados con tu actividad.</p></div>
      </section>
      <section className="documento-seccion">
        <span className="documento-seccion-numero"><i className="bi bi-people" /></span>
        <div><h3>Cuándo se comparte</h3><p>Tu perfil y contenido se muestran según las funciones que utilizas. Al solicitar una adopción o compartir una mascota, los datos necesarios se muestran a las personas involucradas para que puedan responder y coordinar.</p></div>
      </section>
      <section className="documento-seccion">
        <span className="documento-seccion-numero"><i className="bi bi-shield-check" /></span>
        <div><h3>Conservación y seguridad</h3><p>Aplicamos controles de acceso y conservamos la información mientras la cuenta y sus funciones estén activas, salvo que sea necesario mantenerla para resolver solicitudes o cumplir obligaciones aplicables.</p></div>
      </section>
      <section className="documento-seccion">
        <span className="documento-seccion-numero"><i className="bi bi-person-gear" /></span>
        <div><h3>Tus opciones y derechos</h3><p>Puedes revisar o actualizar tus datos desde el perfil y solicitar acceso, corrección o eliminación escribiendo a <a href="mailto:soporte@reddemascotas.com">soporte@reddemascotas.com</a>.</p></div>
      </section>
      <div className="documento-modal-nota">
        Al cerrar esta ventana no aceptas automáticamente: marca la casilla de privacidad del registro si estás de acuerdo con este tratamiento.
      </div>
    </Modal.Body>
    <Modal.Footer className="documento-modal-footer">
      <Button variant="outline-secondary" onClick={handleClose}>Volver al registro</Button>
    </Modal.Footer>
  </Modal>
);
