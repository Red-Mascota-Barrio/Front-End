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
import CompartirMascotaModal from './CompartirMascotaModal';
import { compartidosService, mensajeDeError } from '../../services/compartidosService';
import {
  capitalizar as cap, textoEdad, textoTamano, textoFecha, textoPeso, esMiMascota, yaSolicitoAdopcion,
} from '../../utils/mascotas';

const capitalizar = (t) => cap(t) || '–';
const siNo = (v) => (v === null || v === undefined ? '–' : Number(v) || v === true ? 'Sí' : 'No');

const tituloSobreMascota = (m) => {
  if (!m) return 'Más detalles';
  const nombre = m.nombre ? String(m.nombre).trim() : 'la mascota';
  const esp = String(especieDeMascota(m) || '').toLowerCase();
  const gen = String(m?.genero || '').toLowerCase();
  const esHembra = gen.includes('hemb');

  let tipo = 'mascota';
  if (esp.includes('gat') || esp.includes('felin')) {
    tipo = esHembra ? 'gatita' : 'gatito';
  } else if (esp.includes('perr') || esp.includes('can')) {
    tipo = esHembra ? 'perrita' : 'perrito';
  } else if (esp) {
    tipo = esp;
  }

  const articulo = esHembra ? 'esta' : 'este';
  return `Conoce más a ${nombre} (${articulo} ${tipo})`;
};

export default function PerfilMascotaModal({
  mascota,
  onClose,
  onEliminar,
  onEditar,
  modoAdopcion = false,
  mostrarSolicitudes = false,
  onPublicar,
  onCancelarAdopcion,
  onSolicitudAprobada,
  puedeCompartir = false,
  onDejarDeCompartir,
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
  const [confirmarCancelacion, setConfirmarCancelacion] = useState(false);
  const [cancelandoAdopcion, setCancelandoAdopcion] = useState(false);
  const [errorCancelacion, setErrorCancelacion] = useState('');
  // Compartir mascota (solo el dueño) / retirar el acceso compartido desde el perfil receptor
  const [mostrarCompartir, setMostrarCompartir] = useState(false);
  const [resultadoCompartidos, setResultadoCompartidos] = useState(null);
  const [versionCompartidos, setVersionCompartidos] = useState(0);
  const [quitandoCompartidoId, setQuitandoCompartidoId] = useState(null);
  const [errorCompartidos, setErrorCompartidos] = useState('');
  const [confirmarDejarDeCompartir, setConfirmarDejarDeCompartir] = useState(false);
  const [dejandoDeCompartir, setDejandoDeCompartir] = useState(false);
  const [errorDejarDeCompartir, setErrorDejarDeCompartir] = useState('');
  const { user } = useAuth();
  const mascotaId = mascota?.id_mascotas ?? mascota?.id;
  // Mascota que otra persona compartió conmigo: solo se puede ver (sin editar, publicar, eliminar ni ver solicitudes)
  const esCompartida = Boolean(mascota?.compartida);
  const verSolicitudes = mostrarSolicitudes && !esCompartida;
  const verCompartidos = puedeCompartir && !esCompartida && !modoAdopcion;
  // adopcion_activa_id lo calcula el back (publicación 'Disponible'); si no viene, se deduce de las adopciones
  const estaPublicada = mascota && 'adopcion_activa_id' in mascota
    ? Boolean(mascota.adopcion_activa_id)
    : Boolean(
      mascota?.id_adopcion ||
      (Array.isArray(mascota?.adopciones) && mascota.adopciones.some(
        (adopcion) => adopcion.estado_adopcion === 'Disponible' || adopcion.estado === 'Disponible'
      )) ||
      mascota?.estado_adopcion === 'Disponible'
    );

  useEffect(() => {
    if (!verSolicitudes || !estaPublicada || !mascotaId) return undefined;

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
  }, [verSolicitudes, estaPublicada, mascotaId]);

  // Personas con quienes el dueño compartió esta mascota
  useEffect(() => {
    if (!verCompartidos || !mascotaId) return undefined;

    let vigente = true;
    compartidosService.listar({ mascota_id: mascotaId })
      .then((datos) => {
        if (vigente) setResultadoCompartidos({ mascotaId, datos, error: '' });
      })
      .catch((error) => {
        console.error('Error al cargar con quién se compartió la mascota:', error);
        if (vigente) {
          setResultadoCompartidos({
            mascotaId,
            datos: [],
            error: mensajeDeError(error, 'No se pudo cargar con quién compartiste esta mascota.'),
          });
        }
      });

    return () => {
      vigente = false;
    };
  }, [verCompartidos, mascotaId, versionCompartidos]);

  if (!mascota) return null;

  const resultadoActual = resultadoSolicitudes?.mascotaId === mascotaId ? resultadoSolicitudes : null;
  const solicitudes = resultadoActual?.datos ?? [];
  const cargandoSolicitudes = verSolicitudes && !resultadoActual;
  const compartidosActual = resultadoCompartidos?.mascotaId === mascotaId ? resultadoCompartidos : null;
  const compartidos = compartidosActual?.datos ?? [];
  const errorSolicitudes = resultadoActual?.error ?? '';
  const haySolicitudAprobada = solicitudes.some(
    (solicitud) => String(solicitud.fase_actual).toLowerCase() === 'aprobada'
  );
  const especie = especieDeMascota(mascota);
  const fotoUrl = urlFoto(fotoDeMascota(mascota));
  const idAdopcion = adopcionId
    ?? mascota.adopcion_activa_id
    ?? mascota.id_adopcion
    ?? mascota.adopciones?.find((a) => a.estado_adopcion === 'Disponible')?.id_adopcion;
  const yaSolicitada = solicitudEnviada || yaSolicitoAdopcion(mascota, user?.id_usuario);

  const atributos = [
    ['Especie', especie ? <><IconoEspecie especie={especie} /> {especie}</> : '–'],
    ['Raza', razaDeMascota(mascota) || mascota.raza?.nombre || '–'],
    ['Género', capitalizar(mascota.genero)],
    ['Edad', textoEdad(mascota) ?? '–'],
    ['Fecha de nacimiento', textoFecha(mascota.fecha_nacimiento) || '–'],
    ['Tamaño', textoTamano(mascota.tamano) || '–'],
    ['Peso', textoPeso(mascota.peso_kg) || '–'],
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

  const confirmarCancelarAdopcion = async () => {
    if (!onCancelarAdopcion || !idAdopcion) return;
    setCancelandoAdopcion(true);
    setErrorCancelacion('');
    try {
      await onCancelarAdopcion(idAdopcion, mascotaId);
      setConfirmarCancelacion(false);
    } catch (error) {
      console.error('Error al cancelar la adopción:', error);
      const mensaje = error.response?.data?.mensaje;
      setErrorCancelacion(
        typeof mensaje === 'string' && !/localhost|127\.0\.0\.1/i.test(mensaje)
          ? mensaje
          : 'No se pudo cancelar la adopción. Intenta de nuevo.'
      );
    } finally {
      setCancelandoAdopcion(false);
    }
  };

  // El dueño deja de compartir (o cancela una invitación pendiente)
  const quitarCompartido = async (compartido) => {
    setQuitandoCompartidoId(compartido.id_compartidos);
    setErrorCompartidos('');
    try {
      await compartidosService.eliminar(compartido.id_compartidos);
      setResultadoCompartidos((actual) => actual && ({
        ...actual,
        datos: actual.datos.filter((c) => c.id_compartidos !== compartido.id_compartidos),
      }));
    } catch (error) {
      console.error('Error al dejar de compartir la mascota:', error);
      setErrorCompartidos(mensajeDeError(error, 'No se pudo quitar a esta persona. Intenta de nuevo.'));
    } finally {
      setQuitandoCompartidoId(null);
    }
  };

  // La persona con quien se compartió deja de ver la mascota en su perfil
  const confirmarDejarDeCompartirMascota = async () => {
    if (!mascota.compartido_id) return;
    setDejandoDeCompartir(true);
    setErrorDejarDeCompartir('');
    try {
      await compartidosService.eliminar(mascota.compartido_id);
      setConfirmarDejarDeCompartir(false);
      onDejarDeCompartir?.(mascotaId);
    } catch (error) {
      console.error('Error al dejar de compartir la mascota:', error);
      setErrorDejarDeCompartir(mensajeDeError(error, 'No se pudo quitar la mascota de tu perfil. Intenta de nuevo.'));
    } finally {
      setDejandoDeCompartir(false);
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
          {esCompartida && (
            <span className="badge badge-azul fw-semibold fs-6">
              <i className="bi bi-people-fill" aria-hidden="true" /> Compartida contigo
            </span>
          )}
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
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = SIN_FOTO;
                }}
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

        {(mascota.notas_adicionales || mascota.descripcion) && (
          <div className="mt-4 pt-3 border-top">
            <h5 className="text-primary mb-2">{tituloSobreMascota(mascota)}</h5>
            <p className="text-secondary mb-0" style={{ whiteSpace: 'pre-line' }}>
              {mascota.notas_adicionales || mascota.descripcion}
            </p>
          </div>
        )}

        {verSolicitudes && estaPublicada && (
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

        {verCompartidos && (
          <section className="mt-4 pt-3 border-top">
            <h5 className="text-primary mb-3">Compartida con</h5>
            {!compartidosActual ? (
              <div className="text-center py-2">
                <Spinner animation="border" size="sm" role="status" />
                <span className="ms-2">Cargando…</span>
              </div>
            ) : compartidosActual.error ? (
              <Alert variant="danger" className="mb-0">{compartidosActual.error}</Alert>
            ) : compartidos.length === 0 ? (
              <p className="text-muted mb-0">
                Aún no has compartido a {mascota.nombre} con nadie. Usa el botón &quot;Compartir mascota&quot; para invitar a alguien por su correo.
              </p>
            ) : (
              <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
                {compartidos.map((c) => {
                  const nombre = [c.usuario?.nombre, c.usuario?.apellido].filter(Boolean).join(' ') || 'Sin nombre';
                  const etiqueta = c.estado === 'aceptado'
                    ? { clase: 'badge-verde', texto: 'Aceptada' }
                    : c.estado === 'rechazado'
                      ? { clase: 'badge-gris', texto: 'Rechazada' }
                      : { clase: 'badge-naranja', texto: 'Pendiente' };
                  return (
                    <li key={c.id_compartidos} className="d-flex flex-wrap align-items-center justify-content-between gap-2 border rounded-3 px-3 py-2">
                      <span className="d-flex flex-column">
                        <strong>{nombre}</strong>
                        <small className="text-muted">{c.usuario?.correo || ''}</small>
                      </span>
                      <span className="d-flex align-items-center gap-2">
                        <span className={`badge ${etiqueta.clase}`}>{etiqueta.texto}</span>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => quitarCompartido(c)}
                          disabled={quitandoCompartidoId === c.id_compartidos}
                        >
                          {c.estado === 'pendiente' ? 'Cancelar invitación' : c.estado === 'aceptado' ? 'Dejar de compartir' : 'Quitar'}
                        </Button>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
            {errorCompartidos && <Alert variant="danger" className="mt-2 mb-0">{errorCompartidos}</Alert>}
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

      <Modal.Footer className="d-flex flex-wrap justify-content-between gap-2 border-top pt-3">
        {modoAdopcion ? (
          esMiMascota(mascota, user?.id_usuario) ? (
            <span className="text-muted small align-self-center">Esta mascota te pertenece</span>
          ) : yaSolicitada ? (
            // Ya se postuló: no se vuelve a mostrar el botón de solicitud
            <span className="text-success fw-semibold small align-self-center d-inline-flex align-items-center gap-1">
              <i className="bi bi-check-circle-fill" aria-hidden="true" /> Ya enviaste una solicitud para adoptar a {mascota.nombre}
            </span>
          ) : (
            <Button
              variant="success"
              className="btn-modal-solicitar rounded-pill px-4 py-2 fw-bold d-inline-flex align-items-center gap-2"
              onClick={() => onSolicitar?.(idAdopcion)}
              disabled={!idAdopcion || solicitando}
            >
              <i className="bi bi-heart-fill" aria-hidden="true" />
              {solicitando ? 'Enviando solicitud…' : 'Solicitar adopción'}
            </Button>
          )
        ) : esCompartida ? (
          // Compartida conmigo: solo lectura (sin editar, publicar, compartir ni eliminar)
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <span className="text-muted small d-inline-flex align-items-center gap-1">
              <i className="bi bi-eye" aria-hidden="true" />
              {mascota.compartida_por ? `${mascota.compartida_por} la compartió contigo. ` : 'Compartida contigo. '}
              Solo puedes verla.
            </span>
            {mascota.compartido_id && (
              <button
                type="button"
                className="btn-modal-pill btn-modal-eliminar"
                onClick={() => { setErrorDejarDeCompartir(''); setConfirmarDejarDeCompartir(true); }}
              >
                <i className="bi bi-share" aria-hidden="true" /> Dejar de compartir
              </button>
            )}
          </div>
        ) : (
          <div className="d-flex flex-wrap gap-2 align-items-center">
            {onEditar && (
              <button
                type="button"
                className="btn-modal-pill btn-modal-editar"
                onClick={() => onEditar(mascota)}
                disabled={eliminandoMascota}
              >
                <i className="bi bi-pencil-square" aria-hidden="true" /> Editar mascota
              </button>
            )}
            {puedeCompartir && (
              <button
                type="button"
                className="btn-modal-pill btn-modal-compartir"
                onClick={() => setMostrarCompartir(true)}
                disabled={eliminandoMascota}
              >
                <i className="bi bi-share" aria-hidden="true" /> Compartir mascota
              </button>
            )}
            {onPublicar && (
              <button
                type="button"
                className={`btn-modal-pill ${estaPublicada ? 'btn-modal-publicada' : 'btn-modal-publicar'}`}
                onClick={() => onPublicar(mascota.id_mascotas ?? mascota.id)}
                disabled={estaPublicada || eliminandoMascota}
              >
                <i className={`bi ${estaPublicada ? 'bi-check2-circle' : 'bi-heart-fill'}`} aria-hidden="true" />
                {estaPublicada ? 'Publicada para adopción' : 'Publicar en adopción'}
              </button>
            )}
            {onCancelarAdopcion && estaPublicada && !haySolicitudAprobada && (
              <button
                type="button"
                className="btn-modal-pill btn-modal-cancelar"
                onClick={() => { setErrorCancelacion(''); setConfirmarCancelacion(true); }}
                disabled={eliminandoMascota || cancelandoAdopcion}
              >
                <i className="bi bi-dash-circle" aria-hidden="true" /> Cancelar adopción
              </button>
            )}
            {onEliminar && (
              <button
                type="button"
                className="btn-modal-pill btn-modal-eliminar"
                onClick={handleEliminarClick}
                disabled={eliminandoMascota}
              >
                <i className="bi bi-trash3" aria-hidden="true" />
                {eliminandoMascota ? 'Eliminando…' : 'Eliminar mascota'}
              </button>
            )}
          </div>
        )}
        <button type="button" className="btn-modal-pill btn-modal-cerrar" onClick={onClose}>
          Cerrar
        </button>
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

      {mostrarCompartir && (
        <CompartirMascotaModal
          mascota={mascota}
          onClose={() => setMostrarCompartir(false)}
          onCompartida={() => setVersionCompartidos((v) => v + 1)}
        />
      )}

      <Modal
        show={confirmarDejarDeCompartir}
        onHide={() => {
          if (!dejandoDeCompartir) setConfirmarDejarDeCompartir(false);
        }}
        centered
        backdrop={dejandoDeCompartir ? 'static' : true}
        keyboard={!dejandoDeCompartir}
        aria-labelledby="confirmar-dejar-de-compartir-titulo"
      >
        <Modal.Header closeButton={!dejandoDeCompartir} className="border-0 pb-0">
          <Modal.Title id="confirmar-dejar-de-compartir-titulo" className="h4">
            Dejar de compartir mascota
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center px-4">
          <div className="adopcion-respuesta-icono rechazo">
            <i className="bi bi-eye-slash" aria-hidden="true" />
          </div>
          <p className="text-secondary mb-3">
            {mascota.nombre} dejará de aparecer en tu perfil. Si quieres volver a verla,
            {mascota.compartida_por ? ` ${mascota.compartida_por}` : ' su dueño'} tendrá que compartirla contigo de nuevo.
          </p>
          {errorDejarDeCompartir && <Alert variant="danger" className="mb-0">{errorDejarDeCompartir}</Alert>}
        </Modal.Body>
        <Modal.Footer className="justify-content-center border-0 pt-0">
          <Button
            variant="outline-secondary"
            onClick={() => setConfirmarDejarDeCompartir(false)}
            disabled={dejandoDeCompartir}
          >
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmarDejarDeCompartirMascota} disabled={dejandoDeCompartir}>
            {dejandoDeCompartir ? (
              <>
                <Spinner animation="border" size="sm" aria-hidden="true" /> Dejando de compartir…
              </>
            ) : 'Sí, dejar de compartir'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={confirmarCancelacion}
        onHide={() => {
          if (!cancelandoAdopcion) setConfirmarCancelacion(false);
        }}
        centered
        backdrop={cancelandoAdopcion ? 'static' : true}
        keyboard={!cancelandoAdopcion}
        aria-labelledby="confirmar-cancelacion-titulo"
      >
        <Modal.Header closeButton={!cancelandoAdopcion} className="border-0 pb-0">
          <Modal.Title id="confirmar-cancelacion-titulo" className="h4">
            Cancelar adopción
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center px-4">
          <div className="adopcion-respuesta-icono rechazo">
            <i className="bi bi-house-x" aria-hidden="true" />
          </div>
          <p className="text-secondary mb-3">
            {mascota.nombre} dejará de aparecer en el listado de adopción
            {solicitudes.length > 0 ? ' y las solicitudes pendientes se cerrarán (se avisará a cada persona)' : ''}.
            Podrás volver a publicarla cuando quieras.
          </p>
          {errorCancelacion && (
            <Alert variant="danger" className="mb-0">
              {errorCancelacion}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer className="justify-content-center border-0 pt-0">
          <Button
            variant="outline-secondary"
            onClick={() => setConfirmarCancelacion(false)}
            disabled={cancelandoAdopcion}
          >
            Volver
          </Button>
          <Button
            variant="warning"
            onClick={confirmarCancelarAdopcion}
            disabled={cancelandoAdopcion}
          >
            {cancelandoAdopcion ? (
              <>
                <Spinner animation="border" size="sm" aria-hidden="true" /> Cancelando…
              </>
            ) : 'Sí, retirar de adopción'}
          </Button>
        </Modal.Footer>
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
