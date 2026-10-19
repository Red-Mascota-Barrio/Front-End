import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Button, Spinner, Alert, ButtonGroup } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { eventosService } from '../../services/eventosService';
import { useAuth } from '../../context/AuthContext';
import { aFecha, fechaCorta, normalizar, confirmar } from '../../utils/admin';
import { Icono, IconoTipoEvento } from '../common/Icono';
import { claseBadgeTipo, estadoCupos } from '../../utils/eventos';
import EventoCard, { BotonInscripcion } from './EventoCard';
import VistaCalendario from './VistaCalendario';
import InscripcionModal from './InscripcionModal';
import imagenDestacado from '../../assets/images/inicio/banner.png';
import '../../styles/eventos.css';

const TODOS = 'Todos';

const hoy = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// Evento grande de la parte superior (destacado o, si no hay, el próximo)
const EventoDestacado = ({ evento, onInscribir, onCancelar }) => {
  const { total, quedan } = estadoCupos(evento);
  return (
    <article className="evento-featured">
      <div className="evento-featured-img">
        <img
          src={evento.foto || imagenDestacado}
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = imagenDestacado; }}
          alt={evento.titulo}
        />
        <span className="badge badge-blanco evento-featured-badge"><Icono nombre="star-fill" /> {evento.destacado ? 'Destacado' : 'Próximo evento'}</span>
      </div>
      <div className="evento-featured-info">
        <div>
          <span className={`badge ${claseBadgeTipo(evento.tipo)}`}>
            <IconoTipoEvento tipo={evento.tipo} /> {evento.tipo}
          </span>
          <h2>{evento.titulo}</h2>
          <p>{evento.descripcion}</p>
        </div>
        <div className="evento-meta-list">
          <div className="evento-meta-item"><Icono nombre="calendar-event" /> <strong>{fechaCorta(evento.fecha)}</strong>{evento.hora && ` · ${evento.hora}`}</div>
          {evento.lugar && <div className="evento-meta-item"><Icono nombre="geo-alt" /> <strong>{evento.lugar}</strong></div>}
          <div className="evento-meta-item">
            <Icono nombre="people" /> <strong>{evento.cuposOcupados} inscritos</strong>
            {total > 0 ? ` · ${quedan} cupos libres` : ''}
          </div>
        </div>
        <div>
          <BotonInscripcion evento={evento} onInscribir={onInscribir} onCancelar={onCancelar} size={null} principal />
        </div>
      </div>
    </article>
  );
};

export default function Eventos() {
  const { token } = useAuth();
  const [inscritos, setInscritos] = useState(() => new Set());
  const navigate = useNavigate();

  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState(TODOS);
  const [modoVista, setModoVista] = useState('lista');
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      setEventos(await eventosService.listar());
    } catch (err) {
      console.error('Error al obtener eventos:', err);
      // Sin "response" = no hubo conexión con el servidor; con "response" = el servidor respondió con error
      setError(
        err.response
          ? 'No se pudieron cargar los eventos. Intenta de nuevo más tarde.'
          : 'El servidor no está disponible en este momento. Intenta de nuevo más tarde.',
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(cargar, 0);
    return () => clearTimeout(id);
  }, [cargar]);

  // Con sesión: marca los eventos en los que ya está inscrito (GET /mis-eventos)
  useEffect(() => {
    if (!token) return undefined;
    let activo = true;
    eventosService.idsInscritos().then((ids) => activo && setInscritos(ids)).catch(() => {});
    return () => { activo = false; };
  }, [token]);

  // Solo eventos de hoy en adelante, ordenados por fecha
  const proximos = useMemo(() => {
    const limite = hoy();
    return eventos
      .map((e) => (token && inscritos.has(Number(e.id)) ? { ...e, inscrito: true } : e))
      .filter((e) => {
        const f = aFecha(e.fecha);
        return !f || f >= limite;
      })
      .sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)));
  }, [eventos, inscritos, token]);

  // Tipos que existen en los datos (los de la BD: Vacunación, Adopción, Talleres, Recreación)
  const tipos = useMemo(() => {
    const conteo = new Map();
    proximos.forEach((e) => conteo.set(e.tipo, (conteo.get(e.tipo) ?? 0) + 1));
    return [...conteo.entries()];
  }, [proximos]);

  const destacado = proximos.find((e) => e.destacado) ?? proximos[0];
  const filtrados = proximos.filter((e) => filtroTipo === TODOS || normalizar(e.tipo) === normalizar(filtroTipo));
  const lista = filtroTipo === TODOS && modoVista === 'lista' ? filtrados.filter((e) => e !== destacado) : filtrados;

  const totalInscritos = proximos.reduce((s, e) => s + (Number(e.cuposOcupados) || 0), 0);
  const lugares = [...new Set(proximos.map((e) => e.lugar).filter(Boolean))].slice(0, 8);

  // Para inscribirse hay que haber iniciado sesión
  const abrirInscripcion = (evento) => {
    if (!token) {
      Swal.fire({
        icon: 'info',
        title: 'Inicia sesión',
        text: 'Necesitas una cuenta para inscribirte a un evento.',
        confirmButtonText: 'Ir a iniciar sesión',
        showCancelButton: true,
        cancelButtonText: 'Ahora no',
      }).then((r) => r.isConfirmed && navigate('/login'));
      return;
    }
    setEventoSeleccionado(evento);
  };

  const handleInscribir = async (id) => {
    setEnviando(true);
    try {
      await eventosService.inscribir(id);
      setEventos((prev) =>
        prev.map((e) => (e.id === id ? { ...e, inscrito: true, cuposOcupados: e.cuposOcupados + 1 } : e)),
      );
      setInscritos((prev) => new Set(prev).add(Number(id)));
      setEventoSeleccionado(null);
      Swal.fire({ icon: 'success', title: '¡Inscripción confirmada!', timer: 1800, showConfirmButton: false });
    } catch (error) {
      const msg = error.response?.data?.mensaje || error.response?.data?.message || 'No se pudo completar la inscripción.';
      Swal.fire({ icon: 'error', title: 'Error', text: msg });
    } finally {
      setEnviando(false);
    }
  };

  const handleCancelar = async (evento) => {
    const ok = await confirmar({
      titulo: '¿Cancelar tu inscripción?',
      texto: `Dejarás de estar inscrito en "${evento.titulo}".`,
      boton: 'Sí, cancelar',
      peligro: true,
    });
    if (!ok) return;
    try {
      await eventosService.cancelarInscripcion(evento.id);
      setEventos((prev) =>
        prev.map((e) => (e.id === evento.id ? { ...e, inscrito: false, cuposOcupados: Math.max(0, e.cuposOcupados - 1) } : e)),
      );
      setInscritos((prev) => {
        const nuevo = new Set(prev);
        nuevo.delete(Number(evento.id));
        return nuevo;
      });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.mensaje || 'No se pudo cancelar la inscripción.' });
    }
  };

  return (
    <>
      <section className="pagina-hero">
        <Container>
          <h1>Eventos de la comunidad</h1>
          <p>Jornadas de vacunación, ferias de adopción y actividades pet-friendly en tu barrio</p>
        </Container>
      </section>

      <Container className="pagina-solapada">
        <Row className="g-4">
          {/* CONTENIDO PRINCIPAL */}
          <Col lg={8} xl={9}>
            <div className="barra-herramientas d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
              <div className="filtros-pildora" role="group" aria-label="Filtrar por tipo">
                <button
                  type="button"
                  className={`btn-pildora ${filtroTipo === TODOS ? 'activo' : ''}`}
                  onClick={() => setFiltroTipo(TODOS)}
                >
                  Todos <span className="contador">{proximos.length}</span>
                </button>
                {tipos.map(([tipo, n]) => (
                  <button
                    key={tipo}
                    type="button"
                    className={`btn-pildora ${filtroTipo === tipo ? 'activo' : ''}`}
                    onClick={() => setFiltroTipo(tipo)}
                  >
                    <IconoTipoEvento tipo={tipo} /> {tipo} <span className="contador">{n}</span>
                  </button>
                ))}
              </div>

              <ButtonGroup size="sm" aria-label="Cambiar vista">
                <Button variant={modoVista === 'lista' ? 'primary' : 'light'} onClick={() => setModoVista('lista')}>
                  <i className="bi bi-list-ul" aria-hidden="true" /> Lista
                </Button>
                <Button variant={modoVista === 'calendario' ? 'primary' : 'light'} onClick={() => setModoVista('calendario')}>
                  <i className="bi bi-calendar3" aria-hidden="true" /> Calendario
                </Button>
              </ButtonGroup>
            </div>

            {cargando ? (
              <div className="text-center py-5">
                <Spinner animation="border" role="status" />
                <p className="mt-3 text-muted">Cargando eventos…</p>
              </div>
            ) : error ? (
              <Alert variant="danger" className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                <span><Icono nombre="exclamation-circle" /> {error}</span>
                <Button size="sm" variant="outline-danger" onClick={cargar}>Reintentar</Button>
              </Alert>
            ) : proximos.length === 0 ? (
              <div className="estado-vacio">
                <div className="estado-vacio-icono"><Icono nombre="calendar-x" /></div>
                <h3>No hay eventos próximos</h3>
                <p>Vuelve pronto: se publican jornadas nuevas cada semana.</p>
              </div>
            ) : modoVista === 'calendario' ? (
              <VistaCalendario eventos={filtrados} onInscribir={abrirInscripcion} onCancelar={handleCancelar} />
            ) : (
              <>
                {filtroTipo === TODOS && destacado && (
                  <EventoDestacado evento={destacado} onInscribir={abrirInscripcion} onCancelar={handleCancelar} />
                )}

                {lista.length > 0 && <h3 className="subtitulo-lista">Próximos eventos</h3>}
                {lista.length === 0 && filtroTipo !== TODOS ? (
                  <div className="estado-vacio">
                    <div className="estado-vacio-icono"><IconoTipoEvento tipo={filtroTipo} /></div>
                    <h3>No hay eventos de este tipo</h3>
                    <p>Prueba con otro filtro.</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {lista.map((evt) => (
                      <EventoCard key={evt.id} evento={evt} onInscribir={abrirInscripcion} onCancelar={handleCancelar} />
                    ))}
                  </div>
                )}
              </>
            )}
          </Col>

          {/* SIDEBAR */}
          <Col lg={4} xl={3}>
            <div className="sticky-lateral">
              <div className="tarjeta-lateral">
                <div className="tarjeta-lateral-titulo"><Icono nombre="bar-chart" /> Próximamente</div>
                <div className="mini-stats">
                  <div className="mini-stat">
                    <div className="mini-stat-num">{proximos.length}</div>
                    <div className="mini-stat-lbl">Eventos</div>
                  </div>
                  <div className="mini-stat">
                    <div className="mini-stat-num">{totalInscritos.toLocaleString('es-CO')}</div>
                    <div className="mini-stat-lbl">Inscritos</div>
                  </div>
                </div>
              </div>

              {lugares.length > 0 && (
                <div className="tarjeta-lateral">
                  <div className="tarjeta-lateral-titulo"><Icono nombre="geo-alt" /> Lugares con eventos</div>
                  <div className="d-flex flex-wrap gap-2">
                    {lugares.map((l, i) => (
                      <span key={l} className={`badge ${i < 3 ? 'badge-verde' : 'badge-gris'}`}>{l}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="tarjeta-lateral">
                <div className="tarjeta-lateral-titulo"><Icono nombre="megaphone" /> ¿Organizas un evento?</div>
                <p className="small text-muted mb-3">
                  Si tu fundación o veterinaria quiere publicar una jornada, escríbenos y la añadimos al calendario.
                </p>
                {token ? (
                  <Button as={Link} to="/perfil" variant="outline-primary" size="sm" className="w-100">
                    Ver mis inscripciones
                  </Button>
                ) : (
                  <Button as={Link} to="/registro" variant="outline-primary" size="sm" className="w-100">
                    Crear una cuenta
                  </Button>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {eventoSeleccionado && (
        <InscripcionModal
          evento={eventoSeleccionado}
          enviando={enviando}
          onClose={() => setEventoSeleccionado(null)}
          onConfirmar={handleInscribir}
        />
      )}
    </>
  );
}
