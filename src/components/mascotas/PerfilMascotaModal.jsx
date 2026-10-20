import { useEffect, useState } from 'react';
import { Modal, Row, Col, Button, Alert, Table, Spinner } from 'react-bootstrap';
import {
  urlFoto,
  fotoDeMascota,
  SIN_FOTO,
  mascotasService,
} from '../../services/mascotasService';
import { especieDeMascota, razaDeMascota } from '../../utils/admin';
import { IconoEspecie } from '../common/Icono';
import { capitalizar as cap, textoEdad, textoTamano } from '../../utils/mascotas';

const capitalizar = (t) => cap(t) || '–';
const siNo = (v) => (v === null || v === undefined ? '–' : Number(v) || v === true ? 'Sí' : 'No');

export default function PerfilMascotaModal({
  mascota,
  onClose,
  onEliminar,
  modoAdopcion = false,
  mostrarSolicitudes = false,
  onPublicar,
  errorPublicacion = '',
  adopcionId,
  onSolicitar,
  solicitando = false,
  solicitudEnviada = false,
  mensajeSolicitud = '',
}) {
  const [resultadoSolicitudes, setResultadoSolicitudes] = useState(null);
  const mascotaId = mascota?.id_mascotas ?? mascota?.id;

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
  const especie = especieDeMascota(mascota);
  const fotoUrl = urlFoto(fotoDeMascota(mascota));
  const idAdopcion = adopcionId ?? mascota.id_adopcion ?? mascota.adopciones?.[0]?.id_adopcion;
  const estaPublicada = mascota.adopciones?.some((adopcion) => adopcion.estado_adopcion === 'Disponible') ?? false;

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
    if (window.confirm(`¿Estás seguro de que deseas eliminar a ${mascota.nombre}?`)) {
      const idMascota = mascota.id_mascotas || mascota.id || mascota._id;
      if (onEliminar && idMascota) {
        onEliminar(idMascota);
      }
    }
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

        {(mascota.notas_adicionales || mascota.descripcion) && (
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
              <p className="text-muted mb-0">Aún no hay solicitudes para esta mascota.</p>
            ) : (
              <Table responsive bordered hover size="sm" className="align-middle mb-0">
                <thead>
                  <tr>
                    <th>Persona interesada</th>
                    <th>Correo</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudes.map((solicitud) => (
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
                      <td>{solicitud.fase_actual || 'Solicitado'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
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
          <Button
            variant="success"
            onClick={() => onSolicitar?.(idAdopcion)}
            disabled={!idAdopcion || solicitando || solicitudEnviada}
          >
            {solicitando ? 'Enviando…' : solicitudEnviada ? 'Solicitud enviada' : 'Adoptar'}
          </Button>
        ) : onPublicar ? (
          <Button
            variant={estaPublicada ? 'outline-success' : 'success'}
            onClick={() => onPublicar(mascota.id_mascotas ?? mascota.id)}
            disabled={estaPublicada}
          >
            {estaPublicada ? 'Publicada para adopción' : 'Publicar en adopción'}
          </Button>
        ) : onEliminar ? (
          <Button variant="danger" onClick={handleEliminarClick}>
            Eliminar Mascota
          </Button>
        ) : <span />}
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
