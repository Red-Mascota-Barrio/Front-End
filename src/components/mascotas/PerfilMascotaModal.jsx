import { useState } from 'react';
import { Modal, Row, Col, Button } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { urlFoto, fotoDeMascota, SIN_FOTO, mascotasService } from '../../services/mascotasService';
import { mensajeError } from '../../services/adminService';
import { especieDeMascota, razaDeMascota, estadoMascota, notificarExito, notificarError } from '../../utils/admin';
import { IconoEspecie } from '../common/Icono';
import {
  capitalizar as cap, textoEdad, textoTamano, claseFoto, puedeAdoptar, idMascota, marcarSolicitudLocal,
} from '../../utils/mascotas';

const capitalizar = (t) => cap(t) || '—';
const siNo = (v) => (v === null || v === undefined ? '—' : Number(v) || v === true ? 'Sí' : 'No');

// Detalle de una mascota (diseño de info_mascota.html del mockup).
// Usa los nombres de columna reales: edad_estimada, peso_kg, vacunas_al_dia, notas_adicionales…
export default function PerfilMascotaModal({ mascota, onClose }) {
  const { user, token } = useAuth();
  const [enviando, setEnviando] = useState(false);
  // Tras solicitar, el botón desaparece al instante (marcarSolicitudLocal lo recuerda para la próxima vez)
  const [solicitada, setSolicitada] = useState(false);

  if (!mascota) return null;

  const mostrarAdoptar = Boolean(token) && !solicitada && puedeAdoptar(mascota, user);

  const adoptar = async () => {
    setEnviando(true);
    try {
      await mascotasService.solicitarAdopcion(mascota.adopcion_activa_id);
      marcarSolicitudLocal(user.id_usuario, idMascota(mascota));
      setSolicitada(true);
      notificarExito('Solicitud de adopción enviada');
    } catch (err) {
      // Si la API dice que ya existe una solicitud, también se oculta el botón
      if (err.response?.status === 409) {
        marcarSolicitudLocal(user.id_usuario, idMascota(mascota));
        setSolicitada(true);
      }
      notificarError('No se pudo enviar la solicitud', mensajeError(err));
    } finally {
      setEnviando(false);
    }
  };

  const especie = especieDeMascota(mascota);
  const estado = estadoMascota(mascota);

  const atributos = [
    ['Especie', especie ? <><IconoEspecie especie={especie} /> {especie}</> : '—'],
    ['Raza', razaDeMascota(mascota) || mascota.raza?.nombre || '—'],
    ['Género', capitalizar(mascota.genero)],
    ['Edad', textoEdad(mascota) ?? '—'],
    ['Tamaño', textoTamano(mascota.tamano) || '—'],
    ['Peso', mascota.peso_kg ? `${mascota.peso_kg} kg` : '—'],
    ['Esterilizado', siNo(mascota.esterilizado)],
    ['Vacunas al día', siNo(mascota.vacunas_al_dia ?? mascota.vacunasAlDia)],
  ];

  return (
    <Modal show onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title as="h2" className="h4 mb-0 d-flex align-items-center gap-2 flex-wrap">
          {mascota.nombre}
          {Array.isArray(mascota.adopciones) && <span className="badge badge-verde fs-6 fw-semibold">{estado.texto}</span>}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="g-4">
          <Col md={5}>
            <img
              src={urlFoto(fotoDeMascota(mascota))}
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = SIN_FOTO; e.currentTarget.classList.add('sin-foto'); }}
              alt={mascota.nombre}
              className={`detalle-foto ${claseFoto(urlFoto(fotoDeMascota(mascota)), SIN_FOTO)}`}
            />
          </Col>
          <Col md={7}>
            <div className="info-atributos mb-4">
              {atributos.map(([label, valor]) => (
                <div className="info-atributo" key={label}>
                  <div className="info-atributo-label">{label}</div>
                  <div className="info-atributo-valor">{valor}</div>
                </div>
              ))}
            </div>
            <div className="info-descripcion">
              <h3>Sobre {mascota.nombre}</h3>
              <p>{mascota.notas_adicionales || mascota.descripcion || 'Sin información adicional registrada.'}</p>
            </div>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        {mostrarAdoptar && (
          <Button variant="primary" onClick={adoptar} disabled={enviando}>
            {enviando ? 'Enviando…' : 'Adoptar'}
          </Button>
        )}
        <Button variant="light" onClick={onClose}>Cerrar</Button>
      </Modal.Footer>
    </Modal>
  );
}
