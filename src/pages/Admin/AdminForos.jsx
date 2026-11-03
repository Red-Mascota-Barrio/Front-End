import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Col, ListGroup, Row, Spinner, Table } from 'react-bootstrap';
import { adminService, mensajeError } from '../../services/adminService';
import {
  PageHeader, StatCard, Badge, Toolbar, SelectFiltro, TablaCard, TablaFooter,
  EstadoVacio, Cargando, Aviso, AdminModal, ModalAcciones, BotonAccion,
} from '../../components/admin/AdminUI';
import {
  normalizar, fechaCorta, haceCuanto, aFecha,
  confirmar, notificarExito, notificarError, usePaginacion,
} from '../../utils/admin';

const autorDe = (x) => [x?.usuario?.nombre, x?.usuario?.apellido].filter(Boolean).join(' ') || 'Usuario';
const categoriaDe = (f) => f?.categoria_foro?.nombre_categoria ?? f?.categoriaForo?.nombre_categoria ?? '—';
const comentariosDe = (f) => f?.comentarios_principales ?? f?.comentariosPrincipales ?? [];

// Aplana comentarios y respuestas (cualquier nivel) para listarlos en el detalle
const aplanar = (lista, nivel = 0) =>
  lista.flatMap((c) => [{ ...c, nivel }, ...aplanar(c.respuestas ?? [], nivel + 1)]);

export const AdminForos = () => {
  const [foros, setForos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [detalle, setDetalle] = useState(null); // foro con comentarios
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const [recarga, setRecarga] = useState(0);
  const cargar = useCallback(() => {
    setCargando(true);
    setError('');
    setRecarga((n) => n + 1);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setForos(await adminService.listarForos());
      } catch (e) {
        setForos([]);
        setError(mensajeError(e, 'No pudimos cargar los foros.'));
      } finally {
        setCargando(false);
      }
    })();
  }, [recarga]);

  const categorias = useMemo(
    () => [...new Set(foros.map(categoriaDe).filter((c) => c && c !== '—'))].sort(),
    [foros],
  );

  const filtrados = useMemo(() => {
    const q = normalizar(busqueda);
    return foros.filter((f) => {
      if (filtroCategoria && categoriaDe(f) !== filtroCategoria) return false;
      if (!q) return true;
      return normalizar(`${f.titulo} ${f.contenido} ${autorDe(f)}`).includes(q);
    });
  }, [foros, busqueda, filtroCategoria]);

  const { pagina, setPagina, totalPaginas, visibles } = usePaginacion(filtrados, 10);

  const stats = useMemo(() => {
    const hace7 = new Date().getTime() - 7 * 24 * 3600 * 1000;
    return {
      total: foros.length,
      comentarios: foros.reduce((s, f) => s + Number(f.numero_comentarios ?? 0), 0),
      semana: foros.filter((f) => (aFecha(f.fecha_creacion)?.getTime() ?? 0) >= hace7).length,
      sinRespuesta: foros.filter((f) => !Number(f.numero_comentarios)).length,
    };
  }, [foros]);

  const verDetalle = async (f) => {
    setDetalle({ ...f, cargado: false });
    setCargandoDetalle(true);
    try {
      const completo = await adminService.obtenerForo(f.id_foro);
      setDetalle({ ...f, ...completo, cargado: true });
    } catch (e) {
      notificarError('No se pudo abrir el foro', mensajeError(e));
      setDetalle(null);
    } finally {
      setCargandoDetalle(false);
    }
  };

  const eliminarForo = async (f) => {
    const ok = await confirmar({
      titulo: `¿Eliminar el foro "${f.titulo}"?`,
      texto: 'Se eliminarán también sus comentarios y reportes. Esta acción no se puede deshacer.',
      boton: 'Eliminar',
      peligro: true,
    });
    if (!ok) return;
    try {
      await adminService.eliminarForo(f.id_foro);
      setForos((lista) => lista.filter((x) => x.id_foro !== f.id_foro));
      setDetalle(null);
      notificarExito('Foro eliminado');
    } catch (err) {
      notificarError('No se pudo eliminar', mensajeError(err));
    }
  };

  const eliminarComentario = async (c) => {
    const ok = await confirmar({
      titulo: '¿Eliminar este comentario?',
      texto: 'También se eliminarán sus respuestas. Esta acción no se puede deshacer.',
      boton: 'Eliminar',
      peligro: true,
    });
    if (!ok) return;
    try {
      await adminService.eliminarComentario(c.id_participacion);
      notificarExito('Comentario eliminado');
      await verDetalle(detalle);
      cargar();
    } catch (err) {
      notificarError('No se pudo eliminar', mensajeError(err));
    }
  };

  const comentarios = detalle?.cargado ? aplanar(comentariosDe(detalle)) : [];

  return (
    <>
      <PageHeader
        titulo="Gestión de foros"
        subtitulo={cargando ? 'Cargando foros…' : `${stats.total.toLocaleString('es-CO')} foros publicados por la comunidad`}
      >
        <Button variant="outline-secondary" size="sm" onClick={cargar} disabled={cargando}>
          <i className="bi bi-arrow-clockwise me-1" /> Actualizar
        </Button>
        <Button as={Link} to="/foro" variant="outline-secondary" size="sm">
          <i className="bi bi-box-arrow-up-right me-1" /> Ver foro público
        </Button>
      </PageHeader>

      <Row xs={1} sm={2} xl={4} className="g-3 mb-4">
        <Col><StatCard icono="foro" numero={stats.total} label="Foros" cargando={cargando} /></Col>
        <Col><StatCard icono="usuarios" numero={stats.comentarios} label="Comentarios" cargando={cargando} /></Col>
        <Col><StatCard icono="reloj" numero={stats.semana} label="Nuevos esta semana" cargando={cargando} /></Col>
        <Col><StatCard icono="info" numero={stats.sinRespuesta} label="Sin respuestas" cargando={cargando} /></Col>
      </Row>

      {error && <Aviso tipo="error">{error}</Aviso>}

      <Toolbar busqueda={busqueda} onBusqueda={setBusqueda} placeholder="Buscar por título, contenido o autor…">
        <SelectFiltro
          label="Filtrar por categoría"
          value={filtroCategoria}
          onChange={setFiltroCategoria}
          opciones={[{ value: '', label: 'Todas las categorías' }, ...categorias.map((c) => ({ value: c, label: c }))]}
        />
      </Toolbar>

      <TablaCard>
        {cargando ? (
          <Cargando texto="Cargando foros…" />
        ) : filtrados.length === 0 ? (
          <EstadoVacio
            icono={foros.length ? 'lupa' : 'foro'}
            titulo={foros.length ? 'Sin resultados' : 'Todavía no hay foros'}
            sub={foros.length ? 'Prueba con otra búsqueda o filtro.' : undefined}
          />
        ) : (
          <>
            <Table hover responsive className="align-middle mb-0 small">
              <thead className="table-light">
                <tr>
                  <th>Foro</th>
                  <th>Autor</th>
                  <th>Categoría</th>
                  <th className="text-center">Comentarios</th>
                  <th>Publicado</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((f) => (
                  <tr key={f.id_foro}>
                    <td style={{ maxWidth: 320 }}>
                      <div className="fw-semibold text-truncate">{f.titulo}</div>
                      <div className="text-secondary text-truncate" style={{ fontSize: '.75rem' }}>{f.contenido}</div>
                    </td>
                    <td>{autorDe(f)}</td>
                    <td><Badge variante="success">{categoriaDe(f)}</Badge></td>
                    <td className="text-center">{Number(f.numero_comentarios ?? 0)}</td>
                    <td className="text-secondary">{fechaCorta(f.fecha_creacion)}</td>
                    <td>
                      <div className="d-flex justify-content-end gap-1">
                        <BotonAccion icono="ojo" titulo="Ver foro y comentarios" onClick={() => verDetalle(f)} />
                        <BotonAccion icono="externo" titulo="Abrir en el sitio" as={Link} to={`/foro/${f.id_foro}`} />
                        <BotonAccion icono="eliminar" titulo="Eliminar foro" peligro onClick={() => eliminarForo(f)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <TablaFooter
              mostrando={visibles.length}
              total={filtrados.length}
              nombre="foros"
              pagina={pagina}
              totalPaginas={totalPaginas}
              onPagina={setPagina}
            />
          </>
        )}
      </TablaCard>

      <AdminModal abierto={Boolean(detalle)} size="lg" titulo={detalle?.titulo ?? ''} onCerrar={() => setDetalle(null)}>
        {detalle && (
          <>
            <div className="small text-secondary mb-2">
              {autorDe(detalle)} · {categoriaDe(detalle)} · {fechaCorta(detalle.fecha_creacion)}
            </div>
            <p style={{ whiteSpace: 'pre-line' }}>{detalle.contenido}</p>

            <h6 className="fw-bold mt-4 mb-2">Comentarios ({detalle.cargado ? comentarios.length : '…'})</h6>
            {cargandoDetalle ? (
              <div className="text-center py-3"><Spinner animation="border" size="sm" /></div>
            ) : comentarios.length === 0 ? (
              <p className="text-secondary small mb-0">Este foro todavía no tiene comentarios.</p>
            ) : (
              <ListGroup variant="flush" className="border rounded-3">
                {comentarios.map((c) => (
                  <ListGroup.Item key={c.id_participacion} className="d-flex gap-2 align-items-start" style={{ paddingLeft: 16 + c.nivel * 24 }}>
                    <div className="flex-grow-1">
                      <div className="small">
                        <strong>{autorDe(c)}</strong>
                        <span className="text-secondary"> · {haceCuanto(c.fecha_participacion)}</span>
                        {c.nivel > 0 && <span className="text-secondary"> · respuesta</span>}
                      </div>
                      <div className="small" style={{ whiteSpace: 'pre-line' }}>{c.comentario}</div>
                    </div>
                    <BotonAccion icono="eliminar" titulo="Eliminar comentario" peligro onClick={() => eliminarComentario(c)} />
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}

            <ModalAcciones>
              <Button variant="outline-secondary" onClick={() => setDetalle(null)}>Cerrar</Button>
              <Button variant="danger" onClick={() => eliminarForo(detalle)}>
                <i className="bi bi-trash me-1" /> Eliminar foro
              </Button>
            </ModalAcciones>
          </>
        )}
      </AdminModal>
    </>
  );
};
