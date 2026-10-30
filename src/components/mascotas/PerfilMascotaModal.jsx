import { useEffect, useState } from 'react';
import { Modal, Row, Col, Button, Alert, Table, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import {
  urlFoto,
  fotoDeMascota,
  SIN_FOTO,
  mascotasService,
} from '../../services/mascotasService';
import { especieDeMascota, razaDeMascota } from '../../utils/admin';
import { IconoEspecie } from '../common/Icono';
import { capitalizar as cap, textoEdad, textoTamano, esMiMascota, yaSolicitoAdopcion } from '../../utils/mascotas';

const capitalizar = (t) => cap(t) || '–';
const siNo = (v) => (v === null || v === undefined ? '–' : Number(v) || v === true ? 'Sí' : 'No');

export default function PerfilMascotaModal({
  mascota,
  onClose,
  onEliminar,
  onEditar,
  modoAdopcion = false,
  mostrarSolicitudes = false,
  onPublicar,
  onSolicitudAprobada,
  errorPublicacion = '',
  adopcionId,
  onSolicitar,
  solicitando = false,
  solicitudEnviada = false,
  mensajeSolicitud = '',
}) {
  const [resultadoSolicitudes, setResultadoSolicitudes] = useState(null);
  const [procesandoSolicitudId, setProcesandoSolicitudId] = useState(null);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [eliminandoMascota, setEliminandoMascota] = useState(false);
  const [errorEliminacion, setErrorEliminacion] = useState('');
  const [confirmarEliminacion, setConfirmarEliminacion] = useState(false);
  const { user } = useAuth();
  const mascotaId = mascota?.id_mascotas ?? mascota?.id;
  const estaPublicada = Boolean(
    mascota?.adopcion_activa_id ||
    mascota?.id_adopcion ||
    (Array.isArray(mascota?.adopciones) && mascota.adopciones.some(
      (adopcion) => adopcion.estado_adopcion === 'Disponible' || adopcion.estado === 'Disponible'
    ))
  );

  useEffect(() => {
    if (!mostrarSolicitudes || !mascotaId) return undefined;

    let vigente = true;
    mascotasService.listarSolicitudesDeMascota(mascotaId)
      .then((datos) => {
        if (vigente) setResultadoSolicitudes({ mascotaId, datos, error: '' });
      })
      .catch((error) => {
        console.error('Error al cargar solicitudes de adopción:', error);
        if (vigente) {
          setResultadoSolicitudes({
            mascotaId,
            datos: [],
            error: error.response?.data?.mensaje || 'No se pudieron cargar las solicitudes de adopción.',
          });
        }
      });

    return () => {
      vigente = false;
    };
  }, [mostrarSolicitudes, mascotaId]);

  if (!mascota) return null;

  const resultadoActual = resultadoSolicitudes?.mascotaId === mascotaId ? resultadoSolicitudes : null;
  const solicitudes = resultadoActual?.datos ?? [];
  const cargandoSolicitudes = mostrarSolicitudes && !resultadoActual;
  const errorSolicitudes = resultadoActual?.error ?? '';
  const haySolicitudAprobada = solicitudes.some(
    (solicitud) => String(solicitud.fase_actual).toLowerCase() === 'aprobada'
  );
  const especie = especieDeMascota(mascota);
  const fotoUrl = urlFoto(fotoDeMascota(mascota));
  const idAdopcion = adopcionId ?? mascota.adopcion_activa_id ?? mascota.id_adopcion ?? mascota.adopciones?.[0]?.id_adopcion;

  const atributos = [
    ['Especie', especie ? <><IconoEspecie especie={especie} /> {especie}</> : '–'],
    ['Raza', razaDeMascota(mascota) || mascota.raza?.nombre || '–'],
    ['Género', capitalizar(mascota.genero)],
    ['Edad', textoEdad(mascota) ?? '–'],
    ['Tamaño', textoTamano(mascota.tamano) || '–'],
    ['Peso', mascota.peso_kg ? `${mascota.peso_kg} kg` : '–'],
    ['Esterilizado', siNo(mascota.esterilizado)],
    ['Vacunas al día', siNo(mascota.vacunas_al_dia ?? mascota.vacunasAlDia)],
  ];

  const handleEliminarClick = () => {
    setErrorEliminacion('');
    setConfirmarEliminacion(true);
  };

  const confirmarEliminarMascota = async () => {
    const idMascota = mascota.id_mascotas || mascota.id || mascota._id;
    if (!onEliminar || !idMascota) return;

    setEliminandoMascota(true);
    setErrorEliminacion('');
    try {
      await onEliminar(idMascota);
    } catch (error) {
      console.error('Error al eliminar el perfil de la mascota:', error);
      const mensaje = error.response?.data?.mensaje;
      setErrorEliminacion(
        typeof mensaje === 'string' && !/localhost|127\.0\.0\.1/i.test(mensaje)
          ? mensaje
          : 'No se pudo eliminar el perfil de la mascota. Intenta de nuevo.'
      );
    } finally {
      setEliminandoMascota(false);
    }
  };

  const abrirRespuestaSolicitud = (solicitud, faseActual) => {
    setSolicitudSeleccionada({ solicitud, faseActual, completada: false, error: '' });
  };

  const handleResponderSolicitud = async () => {
    if (!solicitudSeleccionada || solicitudSeleccionada.completada) return;
    const { solicitud, faseActual } = solicitudSeleccionada;
    setProcesandoSolicitudId(solicitud.id_solicitud);
    setSolicitudSeleccionada((actual) => ({ ...actual, error: '' }));
    try {
      const respuesta = await mascotasService.responderSolicitud(solicitud.id_solicitud, faseActual);
      setResultadoSolicitudes((actual) => {
        if (actual?.mascotaId !== mascotaId) return actual;
        return {
          ...actual,
          datos: actual.datos.map((item) => (
            String(item.id_solicitud) === String(solicitud.id_solicitud)
              ? { ...item, ...respuesta.datos, fase_actual: respuesta.datos?.fase_actual || faseActual }
              : item
          )),
        };
      });
      setSolicitudSeleccionada((actual) => ({ ...actual, completada: true }));
    } catch (error) {
      console.error('Error al responder la solicitud de adopción:', error);
      const mensaje = error.response?.data?.mensaje;
      const mensajeSeguro = typeof mensaje === 'string' && !/localhost|127\.0\.0\.1/i.test(mensaje)
        ? mensaje
        : 'No se pudo responder la solicitud. Intenta de nuevo.';
      setSolicitudSeleccionada((actual) => ({ ...actual, error: mensajeSeguro }));
    } finally {
      setProcesandoSolicitudId(null);
    }
  };

  const cerrarRespuestaSolicitud = () => {
    if (procesandoSolicitudId || !solicitudSeleccionada) return;
    const aprobada = solicitudSeleccionada.completada
      && solicitudSeleccionada.faseActual === 'aprobada';
    setSolicitudSeleccionada(null);
    if (aprobada) void onSolicitudAprobada?.(mascotaId);
  };

  return (
    <Modal show={true} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title as="h2" className="h4 mb-0 d-flex align-items-center gap-2 flex-wrap">
          {mascota.nombre}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Row className="g-4 align-items-center">
          <Col md={5} className="text-center">
            <div className="perfil-foto-container rounded-4 overflow-hidden bg-light border p-2">
              <img
                src={fotoUrl}
                alt={mascota.nombre}
                className="img-fluid rounded-3 object-fit-cover shadow-sm"
                style={{ maxHeight: '280px', width: '100%' }}
                onError={(e) => { e.target.src = SIN_FOTO; }}
              />
            </div>
          </Col>

          <Col md={7}>
            <div className="d-flex flex-column gap-3">
              {atributos.map(([label, valor]) => (
                <div key={label} className="d-flex justify-content-between border-bottom pb-2">
                  <span className="text-muted fw-medium">{label}</span>
                  <span className="fw-semibold text-end">{valor}</span>
                </div>
              ))}
            </div>
          </Col>
        </Row>

        {estaPublicada && (mascota.notas_adicionales || mascota.descripcion) && (
          <div className="mt-4 pt-3 border-top">
            <h5 className="text-primary mb-2">Sobre {mascota.nombre}</h5>
            <p className="text-secondary mb-0" style={{ whiteSpace: 'pre-line' }}>
              {mascota.notas_adicionales || mascota.descripcion}
            </p>
          </div>
        )}

        {mostrarSolicitudes && (
          <section className="mt-4 pt-3 border-top">
            <h5 className="text-primary mb-3">Solicitudes de adopción</h5>
            {cargandoSolicitudes ? (
              <div className="text-center py-3">
                <Spinner animation="border" size="sm" role="status" />
                <span className="ms-2">Cargando solicitudes…</span>
              </div>
            ) : errorSolicitudes ? (
              <Alert variant="danger" className="mb-0">{errorSolicitudes}</Alert>
            ) : solicitudes.length === 0 ? (
              <p className="text-muted mb-0">
                {estaPublicada ? 'Aún no hay solicitudes para esta mascota.' : 'Publica a tu mascota en adopción para recibir solicitudes.'}
              </p>
            ) : (
              <>
                <Table responsive bordered hover size="sm" className="align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Persona interesada</th>
                      <th>Correo</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solicitudes.map((solicitud) => {
                      const estado = String(solicitud.fase_actual || 'Solicitado');
                      const estadoNormalizado = estado.toLowerCase();
                      const pendiente = ['solicitado', 'pendiente'].includes(estadoNormalizado);
                      const aprobada = estadoNormalizado === 'aprobada';
                      const rechazada = estadoNormalizado === 'rechazada';
                      const estadoVisible = aprobada ? 'Aprobada' : rechazada ? 'Rechazada' : estado;

                      return (
                        <tr key={solicitud.id_solicitud}>
                          <td>
                            {[solicitud.usuario?.nombre, solicitud.usuario?.apellido].filter(Boolean).join(' ') || 'Sin nombre'}
                          </td>
                          <td>{solicitud.usuario?.correo || '–'}</td>
                          <td>
                            {solicitud.fecha_solicitud
                              ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(new Date(solicitud.fecha_solicitud))
                              : '–'}
                          </td>
                          <td>{estadoVisible}</td>
                          <td>
                            {pendiente && !haySolicitudAprobada ? (
                              <div className="d-flex flex-wrap gap-1">
                                <Button
                                  size="sm"
                                  variant="success"
                                  onClick={() => abrirRespuestaSolicitud(solicitud, 'aprobada')}
                                  disabled={Boolean(procesandoSolicitudId)}
                                >
                                  Aprobar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline-danger"
                                  onClick={() => abrirRespuestaSolicitud(solicitud, 'Rechazada')}
                                  disabled={Boolean(procesandoSolicitudId)}
                                >
                                  Rechazar
                                </Button>
                              </div>
                            ) : aprobada ? (
                              <span className="text-success fw-semibold">Aprobada</span>
                            ) : rechazada ? (
                              <span className="text-danger fw-semibold">Rechazada</span>
                            ) : haySolicitudAprobada && pendiente ? (
                              <span className="text-muted">Adopción aprobada</span>
                            ) : '–'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </>
            )}
          </section>
        )}

        {errorPublicacion && (
          <Alert variant="danger" className="mt-4 mb-0">
            {errorPublicacion}
          </Alert>
        )}

        {modoAdopcion && mensajeSolicitud && (
          <Alert variant={solicitudEnviada ? 'success' : 'danger'} className="mt-4 mb-0">
            {mensajeSolicitud}
          </Alert>
        )}
      </Modal.Body>

      <Modal.Footer className="d-flex justify-content-between">
        {modoAdopcion ? (
          esMiMascota(mascota, user?.id_usuario) ? (
            <span className="text-muted small align-self-center">Esta mascota te pertenece</span>
          ) : (
            <Button
              variant="success"
              onClick={() => onSolicitar?.(idAdopcion)}
              disabled={!idAdopcion || solicitando || solicitudEnviada || yaSolicitoAdopcion(mascota, user?.id_usuario)}
            >
              {solicitando ? 'Enviando…' : (solicitudEnviada || yaSolicitoAdopcion(mascota, user?.id_usuario)) ? 'Solicitud enviada' : 'Adoptar'}
            </Button>
          )
        ) : (
          <div className="d-flex flex-wrap gap-2">
            {onEditar && (
              <Button
                variant="outline-primary"
                onClick={() => onEditar(mascota)}
                disabled={eliminandoMascota}
              >
                <i className="bi bi-pencil-square" aria-hidden="true" /> Editar mascota
              </Button>
            )}
            {onPublicar && (
              <Button
                variant={estaPublicada ? 'outline-success' : 'success'}
                onClick={() => onPublicar(mascota.id_mascotas ?? mascota.id)}
                disabled={estaPublicada || eliminandoMascota}
              >
                {estaPublicada ? 'Publicada para adopción' : 'Publicar en adopción'}
              </Button>
            )}
            {onEliminar && (
              <Button
                variant="outline-danger"
                onClick={handleEliminarClick}
                disabled={eliminandoMascota}
              >
                {eliminandoMascota ? 'Eliminando…' : 'Eliminar mascota'}
              </Button>
            )}
          </div>
        )}
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </Modal.Footer>

      <Modal
        show={Boolean(solicitudSeleccionada)}
        onHide={cerrarRespuestaSolicitud}
        centered
        backdrop={procesandoSolicitudId ? 'static' : true}
        keyboard={!procesandoSolicitudId}
        aria-labelledby="respuesta-solicitud-titulo"
      >
        {solicitudSeleccionada && (
          <>
            <Modal.Header closeButton={!procesandoSolicitudId} className="border-0 pb-0">
              <Modal.Title id="respuesta-solicitud-titulo" className="h4">
                {solicitudSeleccionada.completada
                  ? solicitudSeleccionada.faseActual === 'aprobada' ? '¡Adopción aprobada!' : 'Solicitud rechazada'
                  : solicitudSeleccionada.faseActual === 'aprobada' ? 'Confirmar adopción' : 'Rechazar solicitud'}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center px-4">
              <div className={`adopcion-respuesta-icono ${solicitudSeleccionada.completada ? 'exito' : solicitudSeleccionada.faseActual === 'aprobada' ? 'aprobacion' : 'rechazo'}`}>
                <i
                  className={`bi ${
                    solicitudSeleccionada.completada
                      ? solicitudSeleccionada.faseActual === 'aprobada' ? 'bi-heart-fill' : 'bi-x-lg'
                      : solicitudSeleccionada.faseActual === 'aprobada' ? 'bi-house-heart-fill' : 'bi-exclamation-lg'
                  }`}
                  aria-hidden="true"
                />
              </div>
              {solicitudSeleccionada.completada ? (
                <p className="text-secondary mb-0">
                  {solicitudSeleccionada.faseActual === 'aprobada'
                    ? `${mascota.nombre} ahora forma parte de la familia de esta persona.`
                    : 'La persona recibirá una notificación con tu respuesta.'}
                </p>
              ) : (
                <>
                  <p className="text-secondary mb-3">
                    {solicitudSeleccionada.faseActual === 'aprobada'
                      ? `Al aprobar, ${mascota.nombre} será transferida al perfil de la persona solicitante.`
                      : 'La persona solicitante recibirá una notificación informándole de tu decisión.'}
                  </p>
                  <div className="adopcion-respuesta-persona">
                    <strong>
                      {[
                        solicitudSeleccionada.solicitud.usuario?.nombre,
                        solicitudSeleccionada.solicitud.usuario?.apellido,
                      ].filter(Boolean).join(' ') || 'Persona solicitante'}
                    </strong>
                    <span>{solicitudSeleccionada.solicitud.usuario?.correo || ''}</span>
                  </div>
                </>
              )}
              {solicitudSeleccionada.error && (
                <Alert variant="danger" className="mt-3 mb-0">
                  {solicitudSeleccionada.error}
                </Alert>
              )}
            </Modal.Body>
            <Modal.Footer className="justify-content-center border-0 pt-0">
              {solicitudSeleccionada.completada ? (
                <Button
                  variant="success"
                  onClick={cerrarRespuestaSolicitud}
                >
                  Listo
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline-secondary"
                    onClick={cerrarRespuestaSolicitud}
                    disabled={Boolean(procesandoSolicitudId)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant={solicitudSeleccionada.faseActual === 'aprobada' ? 'success' : 'danger'}
                    onClick={handleResponderSolicitud}
                    disabled={Boolean(procesandoSolicitudId)}
                  >
                    {procesandoSolicitudId
                      ? 'Procesando…'
                      : solicitudSeleccionada.faseActual === 'aprobada'
                        ? 'Sí, aprobar adopción'
                        : 'Sí, rechazar solicitud'}
                  </Button>
                </>
              )}
            </Modal.Footer>
          </>
        )}
      </Modal>

      <Modal
        show={confirmarEliminacion}
        onHide={() => {
          if (!eliminandoMascota) setConfirmarEliminacion(false);
        }}
        centered
        backdrop={eliminandoMascota ? 'static' : true}
        keyboard={!eliminandoMascota}
        aria-labelledby="confirmar-eliminacion-titulo"
      >
        <Modal.Header closeButton={!eliminandoMascota} className="border-0 pb-0">
          <Modal.Title id="confirmar-eliminacion-titulo" className="h4">
            Eliminar perfil
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center px-4">
          <div className="adopcion-respuesta-icono rechazo">
            <i className="bi bi-trash3" aria-hidden="true" />
          </div>
          <p className="text-secondary mb-3">
            ¿Estás seguro de que deseas eliminar el perfil de {mascota.nombre}? Esta acción no se puede deshacer.
          </p>
          {errorEliminacion && (
            <Alert variant="danger" className="mb-0">
              {errorEliminacion}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer className="justify-content-center border-0 pt-0">
          <Button
            variant="outline-secondary"
            onClick={() => setConfirmarEliminacion(false)}
            disabled={eliminandoMascota}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={confirmarEliminarMascota}
            disabled={eliminandoMascota}
          >
            {eliminandoMascota ? (
              <>
                <Spinner animation="border" size="sm" aria-hidden="true" />
                Eliminando…
              </>
            ) : 'Sí, eliminar perfil'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Modal>
  );
}
