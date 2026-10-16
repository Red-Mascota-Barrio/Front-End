import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Button, Card, Col, Row } from 'react-bootstrap';
import { adminService, mensajeError, ESTADOS_REPORTE } from '../../services/adminService';
import {
  PageHeader, StatCard, Badge, Toolbar, SelectFiltro, EstadoVacio, Cargando, Aviso,
} from '../../components/admin/AdminUI';
import {
  normalizar, haceCuanto, gravedadReporte, estadoReporteId, rel, aFecha,
  confirmar, notificarExito, notificarError,
} from '../../utils/admin';

const ETIQUETA_ESTADO = {
  [ESTADOS_REPORTE.PENDIENTE]: { texto: 'Pendiente', clase: 'danger' },
  [ESTADOS_REPORTE.EN_REVISION]: { texto: 'En revisión', clase: 'warning' },
  [ESTADOS_REPORTE.RESUELTO]: { texto: 'Resuelto', clase: 'success' },
};

const ORDEN_GRAVEDAD = { urgente: 0, moderado: 1, bajo: 2 };
// Borde izquierdo de la tarjeta según la gravedad
const BORDE_GRAVEDAD = { urgente: 'border-start border-4 border-danger', moderado: 'border-start border-4 border-warning', bajo: '' };

export const AdminReportes = () => {
  const { refrescarReportes } = useOutletContext() ?? {};
  const [reportes, setReportes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('abiertos');
  const [procesando, setProcesando] = useState(null);

  const [recarga, setRecarga] = useState(0);
  const cargar = useCallback(() => {
    setCargando(true);
    setError('');
    setRecarga((n) => n + 1);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setReportes(await adminService.listarReportes());
      } catch (e) {
        setReportes([]);
        setError(mensajeError(e, 'No pudimos cargar los reportes.'));
      } finally {
        setCargando(false);
      }
    })();
  }, [recarga]);

  const stats = useMemo(() => {
    const ahora = new Date();
    const abiertos = reportes.filter((r) => estadoReporteId(r) !== ESTADOS_REPORTE.RESUELTO);
    return {
      pendientes: abiertos.length,
      resueltosMes: reportes.filter((r) => {
        const f = aFecha(r.fecha_reporte);
        return estadoReporteId(r) === ESTADOS_REPORTE.RESUELTO && f && f.getMonth() === ahora.getMonth() && f.getFullYear() === ahora.getFullYear();
      }).length,
      deHilos: abiertos.filter((r) => r.foro_id && !r.comentario_id).length,
      deComentarios: abiertos.filter((r) => r.comentario_id).length,
    };
  }, [reportes]);

  const filtrados = useMemo(() => {
    const q = normalizar(busqueda);
    return reportes
      .filter((r) => {
        const est = estadoReporteId(r);
        if (filtroEstado === 'abiertos' && est === ESTADOS_REPORTE.RESUELTO) return false;
        if (filtroEstado !== 'abiertos' && filtroEstado !== '' && String(est) !== filtroEstado) return false;
        if (!q) return true;
        const reportado = rel(r, 'usuario_reportado', 'usuarioReportado');
        const tipo = rel(r, 'tipo_reporte', 'tipoReporte');
        return normalizar(`${r.descripcion} ${r.foro?.titulo} ${reportado?.nombre} ${reportado?.apellido} ${tipo?.nombre_tipo}`).includes(q);
      })
      .sort((a, b) => {
        const g = ORDEN_GRAVEDAD[gravedadReporte(a).clave] - ORDEN_GRAVEDAD[gravedadReporte(b).clave];
        if (g !== 0 && filtroEstado === 'abiertos') return g;
        return String(b.fecha_reporte).localeCompare(String(a.fecha_reporte));
      });
  }, [reportes, busqueda, filtroEstado]);

  const actualizarLocal = (id, cambios) =>
    setReportes((lista) => lista.map((r) => (r.id_reporte === id ? { ...r, ...cambios } : r)));

  const cambiarEstado = async (r, estadoId, mensaje) => {
    setProcesando(r.id_reporte);
    try {
      await adminService.cambiarEstadoReporte(r.id_reporte, estadoId);
      actualizarLocal(r.id_reporte, { estado_reporte_id: estadoId, estado_reporte: undefined, estadoReporte: undefined });
      refrescarReportes?.();
      notificarExito(mensaje);
    } catch (err) {
      notificarError('No se pudo actualizar el reporte', mensajeError(err));
    } finally {
      setProcesando(null);
    }
  };

  const resolver = async (r) => {
    const ok = await confirmar({ titulo: '¿Marcar como resuelto?', texto: 'El reporte saldrá de la lista de pendientes.', boton: 'Marcar resuelto' });
    if (ok) cambiarEstado(r, ESTADOS_REPORTE.RESUELTO, 'Reporte resuelto');
  };

  const eliminarContenido = async (r) => {
    const esComentario = Boolean(r.comentario_id);
    const ok = await confirmar({
      titulo: esComentario ? '¿Eliminar el comentario reportado?' : '¿Eliminar el hilo reportado?',
      texto: 'El contenido se borrará del foro y el reporte quedará resuelto. Esta acción no se puede deshacer.',
      boton: 'Eliminar contenido',
      peligro: true,
    });
    if (!ok) return;
    setProcesando(r.id_reporte);
    try {
      await adminService.eliminarContenidoReportado(r);
      actualizarLocal(r.id_reporte, { contenidoEliminado: true });
      await adminService.cambiarEstadoReporte(r.id_reporte, ESTADOS_REPORTE.RESUELTO).catch(() => null);
      actualizarLocal(r.id_reporte, { estado_reporte_id: ESTADOS_REPORTE.RESUELTO, estado_reporte: undefined, estadoReporte: undefined });
      refrescarReportes?.();
      notificarExito('Contenido eliminado');
    } catch (err) {
      notificarError('No se pudo eliminar el contenido', mensajeError(err));
    } finally {
      setProcesando(null);
    }
  };

  const descartar = async (r) => {
    const ok = await confirmar({ titulo: '¿Descartar este reporte?', texto: 'Se eliminará el reporte del sistema sin tocar el contenido.', boton: 'Descartar', peligro: true });
    if (!ok) return;
    setProcesando(r.id_reporte);
    try {
      await adminService.eliminarReporte(r.id_reporte);
      setReportes((lista) => lista.filter((x) => x.id_reporte !== r.id_reporte));
      refrescarReportes?.();
      notificarExito('Reporte descartado');
    } catch (err) {
      notificarError('No se pudo descartar', mensajeError(err));
    } finally {
      setProcesando(null);
    }
  };

  return (
    <>
      <PageHeader titulo="Reportes" subtitulo="Revisa y resuelve los reportes enviados por la comunidad">
        <Badge variante={stats.pendientes ? 'danger' : 'success'} className="fs-6 px-3 py-2">
          {stats.pendientes ? `⚠️ ${stats.pendientes} sin resolver` : '✅ Todo al día'}
        </Badge>
        <Button variant="outline-secondary" size="sm" onClick={cargar} disabled={cargando}>
          <i className="bi bi-arrow-clockwise me-1" /> Actualizar
        </Button>
      </PageHeader>

      <Row xs={1} sm={2} xl={4} className="g-3 mb-4">
        <Col><StatCard icono="alerta" numero={stats.pendientes} label="Pendientes" alerta cargando={cargando} /></Col>
        <Col><StatCard icono="check" numero={stats.resueltosMes} label="Resueltos este mes" cargando={cargando} /></Col>
        <Col><StatCard icono="foro" numero={stats.deHilos} label="De hilos del foro" cargando={cargando} /></Col>
        <Col><StatCard icono="usuarios" numero={stats.deComentarios} label="De comentarios" cargando={cargando} /></Col>
      </Row>

      {error && <Aviso tipo="error">{error}</Aviso>}

      <Toolbar busqueda={busqueda} onBusqueda={setBusqueda} placeholder="Buscar por descripción, hilo o usuario…">
        <SelectFiltro
          label="Filtrar por estado"
          value={filtroEstado}
          onChange={setFiltroEstado}
          opciones={[
            { value: 'abiertos', label: 'Sin resolver' },
            { value: String(ESTADOS_REPORTE.PENDIENTE), label: 'Pendientes' },
            { value: String(ESTADOS_REPORTE.EN_REVISION), label: 'En revisión' },
            { value: String(ESTADOS_REPORTE.RESUELTO), label: 'Resueltos' },
            { value: '', label: 'Todos' },
          ]}
        />
      </Toolbar>

      {cargando ? (
        <Card className="border-0 shadow-sm"><Cargando texto="Cargando reportes…" /></Card>
      ) : filtrados.length === 0 ? (
        <Card className="border-0 shadow-sm">
          {filtroEstado === 'abiertos' && !busqueda ? (
            <EstadoVacio icono="✅" titulo="Todo resuelto" sub="No hay reportes pendientes por revisar." />
          ) : (
            <EstadoVacio icono="🔍" titulo="Sin resultados" sub="No hay reportes con estos filtros." />
          )}
        </Card>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filtrados.map((r) => {
            const gravedad = gravedadReporte(r);
            const estId = estadoReporteId(r);
            const resuelto = estId === ESTADOS_REPORTE.RESUELTO;
            const est = ETIQUETA_ESTADO[estId] ?? ETIQUETA_ESTADO[1];
            const tipo = rel(r, 'tipo_reporte', 'tipoReporte');
            const reportado = rel(r, 'usuario_reportado', 'usuarioReportado');
            const comentario = r.participacion;
            const ocupado = procesando === r.id_reporte;
            const textoComentario = comentario?.comentario ?? comentario?.contenido;

            return (
              <Card
                key={r.id_reporte}
                className={`border-0 shadow-sm ${resuelto ? 'opacity-75' : BORDE_GRAVEDAD[gravedad.clave]}`}
              >
                <Card.Body>
                  <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
                    <div>
                      <h2 className="h6 fw-bold mb-1">
                        {tipo?.nombre_tipo ?? 'Reporte'}{r.foro?.titulo ? ` en “${r.foro.titulo}”` : ''}
                      </h2>
                      <div className="d-flex flex-wrap gap-3 small text-secondary">
                        {reportado && (
                          <span><i className="bi bi-person me-1" />Usuario reportado: <strong>{reportado.nombre} {reportado.apellido}</strong></span>
                        )}
                        <span><i className="bi bi-calendar3 me-1" />{haceCuanto(r.fecha_reporte)}</span>
                        <span><i className="bi bi-geo-alt me-1" />{r.comentario_id ? 'Comentario' : 'Hilo'}{r.foro?.titulo ? `: "${r.foro.titulo}"` : ''}</span>
                      </div>
                    </div>
                    <div className="d-flex flex-wrap gap-1">
                      {!resuelto && <Badge variante={gravedad.clase}>{gravedad.texto}</Badge>}
                      <Badge variante={est.clase}>{est.texto}</Badge>
                      <Badge variante="primary">💬 Foro</Badge>
                    </div>
                  </div>

                  <p className="bg-body-tertiary rounded-3 p-3 small mb-2">{r.descripcion}</p>
                  {textoComentario && (
                    <blockquote className="border-start border-3 ps-3 small text-secondary fst-italic mb-3">
                      Comentario reportado: “{textoComentario}”
                    </blockquote>
                  )}

                  <div className="d-flex flex-wrap gap-2">
                    {r.foro_id && (
                      <Button as={Link} to={`/foro/${r.foro_id}`} variant="outline-secondary" size="sm">
                        <i className="bi bi-eye me-1" /> Ver hilo
                      </Button>
                    )}
                    {!r.contenidoEliminado && (r.foro_id || r.comentario_id) && (
                      <Button variant="outline-danger" size="sm" disabled={ocupado} onClick={() => eliminarContenido(r)}>
                        <i className="bi bi-trash me-1" /> {r.comentario_id ? 'Eliminar comentario' : 'Eliminar hilo'}
                      </Button>
                    )}
                    {estId === ESTADOS_REPORTE.PENDIENTE && (
                      <Button
                        variant="outline-warning"
                        size="sm"
                        disabled={ocupado}
                        onClick={() => cambiarEstado(r, ESTADOS_REPORTE.EN_REVISION, 'Reporte en revisión')}
                      >
                        <i className="bi bi-search me-1" /> Poner en revisión
                      </Button>
                    )}
                    {resuelto ? (
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        disabled={ocupado}
                        onClick={() => cambiarEstado(r, ESTADOS_REPORTE.PENDIENTE, 'Reporte reabierto')}
                      >
                        <i className="bi bi-arrow-counterclockwise me-1" /> Reabrir
                      </Button>
                    ) : (
                      <Button variant="success" size="sm" disabled={ocupado} onClick={() => resolver(r)}>
                        <i className="bi bi-check-circle me-1" /> Marcar como resuelto
                      </Button>
                    )}
                    <Button variant="link" size="sm" className="text-secondary" disabled={ocupado} onClick={() => descartar(r)}>
                      Descartar
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
};
