import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Col, Row, Table } from 'react-bootstrap';
import { adminService, mensajeError } from '../../services/adminService';
import { urlFoto, fotoDeMascota, SIN_FOTO } from '../../services/mascotasService';
import {
  PageHeader, StatCard, Badge, Toolbar, SelectFiltro, TablaCard, TablaFooter,
  EstadoVacio, Cargando, Aviso, AdminModal, ModalAcciones, BotonAccion,
} from '../../components/admin/AdminUI';
import {
  normalizar, fechaCorta, especieDeMascota, razaDeMascota, claseIconoEspecie,
  confirmar, notificarExito, notificarError, usePaginacion,
} from '../../utils/admin';
import { IconoEspecie } from '../../components/common/Icono';

// Estado de la publicación (enum estado_adopcion de la tabla adopciones)
const ESTADOS = {
  disponible: { texto: 'En adopción', clase: 'success' },
  adoptado: { texto: 'Adoptado', clase: 'primary' },
  cancelada: { texto: 'Cancelada', clase: 'danger' },
  'no disponible': { texto: 'No disponible', clase: 'warning' },
};
const estadoDe = (a) => ESTADOS[normalizar(a?.estado_adopcion)] ?? { texto: a?.estado_adopcion || '—', clase: 'secondary' };

// Fase de cada solicitud (enum fase_actual de la tabla solicitudes)
const FASES = {
  solicitado: { texto: 'Pendiente', clase: 'warning' },
  aprobada: { texto: 'Aprobada', clase: 'success' },
  rechazada: { texto: 'Rechazada', clase: 'secondary' },
};
const faseDe = (s) => FASES[normalizar(s?.fase_actual)] ?? { texto: s?.fase_actual || '—', clase: 'secondary' };

const nombrePersona = (u) => [u?.nombre, u?.apellido].filter(Boolean).join(' ') || '—';
const alFallar = (e) => { e.currentTarget.onerror = null; e.currentTarget.src = SIN_FOTO; };

export const AdminAdopciones = () => {
  const [adopciones, setAdopciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [detalle, setDetalle] = useState(null);

  const [recarga, setRecarga] = useState(0);
  const cargar = useCallback(() => {
    setCargando(true);
    setError('');
    setRecarga((n) => n + 1);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setAdopciones(await adminService.listarAdopciones());
      } catch (e) {
        setAdopciones([]);
        setError(mensajeError(e, 'No pudimos cargar las adopciones.'));
      } finally {
        setCargando(false);
      }
    })();
  }, [recarga]);

  const filtrados = useMemo(() => {
    const q = normalizar(busqueda);
    return adopciones.filter((a) => {
      if (filtroEstado && normalizar(a.estado_adopcion) !== filtroEstado) return false;
      if (!q) return true;
      const m = a.mascota ?? {};
      return normalizar(
        `${m.nombre} ${razaDeMascota(m)} ${especieDeMascota(m)} ${nombrePersona(a.usuario)} ${a.usuario?.correo ?? ''}`,
      ).includes(q);
    });
  }, [adopciones, busqueda, filtroEstado]);

  const { pagina, setPagina, totalPaginas, visibles } = usePaginacion(filtrados, 10);

  const stats = useMemo(() => {
    const cuenta = (estado) => adopciones.filter((a) => normalizar(a.estado_adopcion) === estado).length;
    return {
      disponibles: cuenta('disponible'),
      adoptadas: cuenta('adoptado'),
      canceladas: cuenta('cancelada'),
      solicitudes: adopciones.reduce((s, a) => s + Number(a.solicitudes_count ?? a.solicitudes?.length ?? 0), 0),
    };
  }, [adopciones]);

  const cancelar = async (a) => {
    const nombre = a.mascota?.nombre ?? 'la mascota';
    const ok = await confirmar({
      titulo: `¿Retirar a ${nombre} de adopción?`,
      texto: 'La publicación quedará cancelada y las solicitudes pendientes se cerrarán. Se avisará a cada persona.',
      boton: 'Retirar de adopción',
      peligro: true,
    });
    if (!ok) return;
    try {
      await adminService.cancelarAdopcion(a.id_adopcion);
      notificarExito('Publicación cancelada');
      setDetalle(null);
      cargar();
    } catch (err) {
      notificarError('No se pudo cancelar', mensajeError(err));
    }
  };

  const mDetalle = detalle?.mascota ?? null;
  const fotoDetalle = mDetalle ? fotoDeMascota(mDetalle) : null;

  return (
    <>
      <PageHeader
        titulo="Gestión de adopciones"
        subtitulo={cargando ? 'Cargando adopciones…' : `${adopciones.length.toLocaleString('es-CO')} publicaciones de adopción en la plataforma`}
      >
        <Button variant="outline-secondary" size="sm" onClick={cargar} disabled={cargando}>
          <i className="bi bi-arrow-clockwise me-1" /> Actualizar
        </Button>
        <Button as={Link} to="/mascotas" variant="outline-secondary" size="sm">
          <i className="bi bi-box-arrow-up-right me-1" /> Ver listado público
        </Button>
      </PageHeader>

      <Row xs={1} sm={2} xl={4} className="g-3 mb-4">
        <Col><StatCard icono="reloj" numero={stats.disponibles} label="En adopción" cargando={cargando} /></Col>
        <Col><StatCard icono="check" numero={stats.adoptadas} label="Adoptadas" cargando={cargando} /></Col>
        <Col><StatCard icono="pausa" numero={stats.canceladas} label="Canceladas" cargando={cargando} /></Col>
        <Col><StatCard icono="usuarios" numero={stats.solicitudes} label="Solicitudes recibidas" cargando={cargando} /></Col>
      </Row>

      {error && <Aviso tipo="error">{error}</Aviso>}

      <Toolbar busqueda={busqueda} onBusqueda={setBusqueda} placeholder="Buscar por mascota, raza o quien publica…">
        <SelectFiltro
          label="Filtrar por estado"
          value={filtroEstado}
          onChange={setFiltroEstado}
          opciones={[
            { value: '', label: 'Todos los estados' },
            { value: 'disponible', label: 'En adopción' },
            { value: 'adoptado', label: 'Adoptado' },
            { value: 'cancelada', label: 'Cancelada' },
          ]}
        />
      </Toolbar>

      <TablaCard>
        {cargando ? (
          <Cargando texto="Cargando adopciones…" />
        ) : filtrados.length === 0 ? (
          <EstadoVacio
            icono={adopciones.length ? 'lupa' : 'corazon'}
            titulo={adopciones.length ? 'Sin resultados' : 'Todavía no hay adopciones'}
            sub={adopciones.length ? 'Prueba con otra búsqueda o filtro.' : 'Cuando alguien publique una mascota en adopción aparecerá aquí.'}
          />
        ) : (
          <>
            <Table hover responsive className="align-middle mb-0 small">
              <thead className="table-light">
                <tr>
                  <th>Mascota</th>
                  <th>Publicada por</th>
                  <th>Estado</th>
                  <th className="text-center">Solicitudes</th>
                  <th>Fecha adopción</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((a) => {
                  const m = a.mascota ?? {};
                  const especie = especieDeMascota(m);
                  const color = claseIconoEspecie(especie);
                  const foto = fotoDeMascota(m);
                  const est = estadoDe(a);
                  const total = Number(a.solicitudes_count ?? a.solicitudes?.length ?? 0);
                  const pendientes = (a.solicitudes ?? []).filter((s) => normalizar(s.fase_actual) === 'solicitado').length;
                  return (
                    <tr key={a.id_adopcion}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className={`adm-avatar rounded-3 border fs-5 bg-${color}-subtle border-${color}-subtle`}>
                            {foto ? <img src={urlFoto(foto)} alt="" onError={alFallar} /> : <IconoEspecie especie={especie} />}
                          </div>
                          <div>
                            <div className="fw-semibold">{m.nombre ?? 'Mascota eliminada'}</div>
                            <div className="text-secondary" style={{ fontSize: '.75rem' }}>
                              {[especie, razaDeMascota(m)].filter(Boolean).join(' · ') || '—'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>{nombrePersona(a.usuario)}</div>
                        <div className="text-secondary" style={{ fontSize: '.75rem' }}>{a.usuario?.correo ?? ''}</div>
                      </td>
                      <td><Badge variante={est.clase}>{est.texto}</Badge></td>
                      <td className="text-center">
                        {total}
                        {pendientes > 0 && <div className="text-warning-emphasis" style={{ fontSize: '.7rem' }}>{pendientes} pendiente{pendientes === 1 ? '' : 's'}</div>}
                      </td>
                      <td className="text-secondary">{a.fecha_adopcion ? fechaCorta(a.fecha_adopcion) : '—'}</td>
                      <td>
                        <div className="d-flex justify-content-end gap-1">
                          <BotonAccion icono="ojo" titulo="Ver detalle" onClick={() => setDetalle(a)} />
                          {normalizar(a.estado_adopcion) === 'disponible' && (
                            <BotonAccion icono="pausa" titulo="Retirar de adopción" peligro onClick={() => cancelar(a)} />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            <TablaFooter
              mostrando={visibles.length}
              total={filtrados.length}
              nombre="adopciones"
              pagina={pagina}
              totalPaginas={totalPaginas}
              onPagina={setPagina}
            />
          </>
        )}
      </TablaCard>

      <AdminModal
        abierto={Boolean(detalle)}
        size="lg"
        titulo={mDetalle ? <><IconoEspecie especie={especieDeMascota(mDetalle)} /> {mDetalle.nombre}</> : 'Adopción'}
        onCerrar={() => setDetalle(null)}
      >
        {detalle && (
          <>
            <Row className="g-3">
              {fotoDetalle && (
                <Col sm={5}>
                  <img
                    src={urlFoto(fotoDetalle)}
                    alt={mDetalle?.nombre ?? ''}
                    onError={alFallar}
                    className="w-100 rounded-4 object-fit-cover"
                    style={{ height: 200 }}
                  />
                </Col>
              )}
              <Col sm={fotoDetalle ? 7 : 12}>
                <dl className="row small mb-0">
                  <dt className="col-5 text-secondary fw-medium">Estado</dt>
                  <dd className="col-7"><Badge variante={estadoDe(detalle).clase}>{estadoDe(detalle).texto}</Badge></dd>
                  <dt className="col-5 text-secondary fw-medium">Especie / raza</dt>
                  <dd className="col-7">{[especieDeMascota(mDetalle), razaDeMascota(mDetalle)].filter(Boolean).join(' · ') || '—'}</dd>
                  <dt className="col-5 text-secondary fw-medium">Publicada por</dt>
                  <dd className="col-7">{nombrePersona(detalle.usuario)}<br /><span className="text-secondary">{detalle.usuario?.correo}</span></dd>
                  <dt className="col-5 text-secondary fw-medium">Fecha de adopción</dt>
                  <dd className="col-7">{detalle.fecha_adopcion ? fechaCorta(detalle.fecha_adopcion) : '—'}</dd>
                </dl>
              </Col>
            </Row>

            <h6 className="fw-bold mt-4 mb-2">Solicitudes ({detalle.solicitudes?.length ?? 0})</h6>
            {detalle.solicitudes?.length ? (
              <Table size="sm" bordered responsive className="align-middle small mb-0">
                <thead className="table-light">
                  <tr><th>Persona</th><th>Correo</th><th>Fecha</th><th>Estado</th></tr>
                </thead>
                <tbody>
                  {detalle.solicitudes.map((s) => (
                    <tr key={s.id_solicitud}>
                      <td>{nombrePersona(s.usuario)}</td>
                      <td>{s.usuario?.correo ?? '—'}</td>
                      <td>{fechaCorta(s.fecha_solicitud)}</td>
                      <td><Badge variante={faseDe(s).clase}>{faseDe(s).texto}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p className="text-secondary small mb-0">Nadie ha enviado solicitudes para esta publicación.</p>
            )}

            <ModalAcciones>
              <Button variant="outline-secondary" onClick={() => setDetalle(null)}>Cerrar</Button>
              {normalizar(detalle.estado_adopcion) === 'disponible' && (
                <Button variant="danger" onClick={() => cancelar(detalle)}>
                  <i className="bi bi-x-circle me-1" /> Retirar de adopción
                </Button>
              )}
            </ModalAcciones>
          </>
        )}
      </AdminModal>
    </>
  );
};
