import { useEffect, useState } from 'react';
import { Modal, Button, Alert, Spinner } from 'react-bootstrap';
import { compartidosService, mensajeDeError } from '../../services/compartidosService';
import { urlFoto, fotoDeMascota, SIN_FOTO } from '../../services/mascotasService';
import { especieDeMascota, razaDeMascota } from '../../utils/admin';

const TEXTO_ESTADO = { aceptado: 'aceptaste', rechazado: 'rechazaste' };

// Se abre al hacer clic en la notificación "Te quieren compartir una mascota".
// La persona decide si acepta o rechaza; si acepta, la mascota aparece en su perfil solo para verla.
export default function ResponderCompartidoModal({ compartidoId, onClose, onAceptada }) {
  const [carga, setCarga] = useState({ cargando: true, invitacion: null, error: '' });
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null); // { estado, mensaje, mascotaId } o { error }

  useEffect(() => {
    let vigente = true;
    compartidosService.listar({ tipo: 'recibidos' })
      .then((lista) => {
        if (!vigente) return;
        const invitacion = lista.find((c) => String(c.id_compartidos) === String(compartidoId)) ?? null;
        setCarga({ cargando: false, invitacion, error: '' });
      })
      .catch((err) => {
        console.error('Error al cargar la invitación de mascota compartida:', err);
        if (vigente) {
          setCarga({ cargando: false, invitacion: null, error: mensajeDeError(err, 'No pudimos cargar la invitación.') });
        }
      });
    return () => { vigente = false; };
  }, [compartidoId]);

  const { cargando, invitacion, error } = carga;
  const mascota = invitacion?.relacion?.mascota;
  const dueno = invitacion?.relacion?.usuario;
  const nombreDueno = [dueno?.nombre, dueno?.apellido].filter(Boolean).join(' ') || 'Una persona';
  const especie = mascota ? especieDeMascota(mascota) : '';
  const raza = mascota ? razaDeMascota(mascota) : '';

  const responder = async (estado) => {
    if (enviando) return;
    setEnviando(true);
    try {
      const respuesta = await compartidosService.responder(compartidoId, estado);
      setResultado({ estado, mensaje: respuesta?.mensaje, mascotaId: mascota?.id_mascotas });
    } catch (err) {
      console.error('Error al responder la mascota compartida:', err);
      setResultado({ error: mensajeDeError(err, 'No pudimos registrar tu respuesta. Intenta de nuevo.') });
    } finally {
      setEnviando(false);
    }
  };

  const cerrar = () => {
    if (enviando) return;
    if (resultado?.estado === 'aceptado') onAceptada?.(resultado.mascotaId);
    else onClose();
  };

  // Estados posibles del contenido
  let contenido;
  if (cargando) {
    contenido = (
      <div className="text-center py-4">
        <Spinner animation="border" size="sm" role="status" />
        <span className="ms-2">Cargando invitación…</span>
      </div>
    );
  } else if (error) {
    contenido = <Alert variant="danger" className="mb-0">{error}</Alert>;
  } else if (!invitacion) {
    contenido = (
      <Alert variant="secondary" className="mb-0">
        Esta invitación ya no está disponible: la mascota cambió de dueño, fue eliminada o la persona dejó de compartirla.
      </Alert>
    );
  } else if (resultado?.estado) {
    contenido = (
      <Alert variant={resultado.estado === 'aceptado' ? 'success' : 'secondary'} className="mb-0">
        {resultado.mensaje || `Ya ${TEXTO_ESTADO[resultado.estado]} la invitación.`}
      </Alert>
    );
  } else if (invitacion.estado !== 'pendiente') {
    contenido = (
      <Alert variant="secondary" className="mb-0">
        Ya {TEXTO_ESTADO[invitacion.estado] ?? 'respondiste'} esta invitación.
      </Alert>
    );
  } else {
    contenido = (
      <>
        <img
          src={urlFoto(fotoDeMascota(mascota))}
          alt={mascota?.nombre}
          className="rounded-circle object-fit-cover shadow-sm mb-3"
          style={{ width: 120, height: 120 }}
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = SIN_FOTO; }}
        />
        <h3 className="h5 mb-1">{mascota?.nombre}</h3>
        {(especie || raza) && (
          <p className="text-muted small mb-3">{[especie, raza].filter(Boolean).join(' · ')}</p>
        )}
        <p className="text-secondary mb-0">
          <strong>{nombreDueno}</strong> quiere compartir a {mascota?.nombre} contigo. Si aceptas,
          aparecerá en tu perfil solo para que la veas: no podrás editarla, publicarla en adopción ni eliminarla.
        </p>
      </>
    );
  }

  const puedeResponder = Boolean(invitacion) && invitacion.estado === 'pendiente' && !resultado?.estado;

  return (
    <Modal
      show
      onHide={cerrar}
      centered
      dialogClassName="modal-responder-compartido"
      backdrop={enviando ? 'static' : true}
      keyboard={!enviando}
      aria-labelledby="responder-compartido-titulo"
    >
      <Modal.Header closeButton={!enviando} className="border-0 pb-0">
        <Modal.Title id="responder-compartido-titulo" className="h4">
          Mascota compartida
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="text-center px-4">
        {contenido}
        {resultado?.error && <Alert variant="danger" className="mt-3 mb-0">{resultado.error}</Alert>}
      </Modal.Body>

      <Modal.Footer className="justify-content-center border-0 pt-0">
        {puedeResponder ? (
          <>
            <Button variant="outline-danger" onClick={() => responder('rechazado')} disabled={enviando}>
              Rechazar
            </Button>
            <Button variant="success" onClick={() => responder('aceptado')} disabled={enviando}>
              {enviando ? (
                <>
                  <Spinner animation="border" size="sm" aria-hidden="true" /> Enviando…
                </>
              ) : 'Aceptar'}
            </Button>
          </>
        ) : (
          <Button variant="success" onClick={cerrar} disabled={enviando}>
            {resultado?.estado === 'aceptado' ? 'Ver en mi perfil' : 'Cerrar'}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}
