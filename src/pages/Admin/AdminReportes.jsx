import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { adminService, mensajeError, ESTADOS_REPORTE } from '../../services/adminService';
import {
  PageHeader, StatCard, Badge, Toolbar, SelectFiltro, EstadoVacio, Cargando, Aviso,
} from '../../components/admin/AdminUI';
import {
  normalizar, haceCuanto, gravedadReporte, estadoReporteId, rel, aFecha,
  confirmar, notificarExito, notificarError,
} from '../../utils/admin';

const ETIQUETA_ESTADO = {
  [ESTADOS_REPORTE.PENDIENTE]: { texto: 'Pendiente', clase: 'adm-badge-rojo' },
  [ESTADOS_REPORTE.EN_REVISION]: { texto: 'En revisión', clase: 'adm-badge-naranja' },
  [ESTADOS_REPORTE.RESUELTO]: { texto: 'Resuelto', clase: 'adm-badge-verde' },
};

const ORDEN_GRAVEDAD = { urgente: 0, moderado: 1, bajo: 2 };

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
        <Badge clase={stats.pendientes ? 'adm-badge-rojo' : 'adm-badge-verde'} className="adm-badge-lg">
          {stats.pendientes ? `⚠️ ${stats.pendientes} sin resolver` : '✅ Todo al día'}
        </Badge>
        <button type="button" className="adm-btn adm-btn-ghost adm-btn-sm" onClick={cargar} disabled={cargando}>
          ↻ Actualizar
        </button>
      </PageHeader>

      <div className="adm-grid-4 adm-mb-md">
        <StatCard icono="alerta" numero={stats.pendientes} label="Pendientes" alerta cargando={cargando} />
        <StatCard icono="check" numero={stats.resueltosMes} label="Resueltos este mes" cargando={cargando} />
        <StatCard icono="foro" numero={stats.deHilos} label="De hilos del foro" cargando={cargando} />
        <StatCard icono="usuarios" numero={stats.deComentarios} label="De comentarios" cargando={cargando} />
      </div>

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
        <div className="adm-tarjeta"><Cargando texto="Cargando reportes…" /></div>
      ) : filtrados.length === 0 ? (
        <div className="adm-tarjeta">
          {filtroEstado === 'abiertos' && !busqueda ? (
            <EstadoVacio icono="✅" titulo="Todo resuelto" sub="No hay reportes pendientes por revisar." />
          ) : (
            <EstadoVacio icono="🔍" titulo="Sin resultados" sub="No hay reportes con estos filtros." />
          )}
        </div>
      ) : (
        filtrados.map((r) => {
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
            <div key={r.id_reporte} className={`adm-reporte-card ${resuelto ? 'resuelto' : gravedad.clave}`}>
              <div className="adm-reporte-header">
                <div>
                  <div className="adm-reporte-titulo">{tipo?.nombre_tipo ?? 'Reporte'}{r.foro?.titulo ? ` en “${r.foro.titulo}”` : ''}</div>
                  <div className="adm-reporte-meta">
                    {reportado && (
                      <span>👤 Usuario reportado: <strong>{reportado.nombre} {reportado.apellido}</strong></span>
                    )}
                    <span>📅 {haceCuanto(r.fecha_reporte)}</span>
                    <span>📍 {r.comentario_id ? 'Comentario' : 'Hilo'}{r.foro?.titulo ? `: "${r.foro.titulo}"` : ''}</span>
                  </div>
                </div>
                <div className="adm-reporte-badges">
                  {!resuelto && <Badge clase={gravedad.clase}>{gravedad.texto}</Badge>}
                  <Badge clase={est.clase}>{est.texto}</Badge>
                  <Badge clase="adm-badge-azul">💬 Foro</Badge>
                </div>
              </div>

              <div className="adm-reporte-cuerpo">{r.descripcion}</div>
              {textoComentario && <div className="adm-reporte-cita">Comentario reportado: “{textoComentario}”</div>}

              <div className="adm-reporte-acciones">
                {r.foro_id && (
                  <Link to={`/foro/${r.foro_id}`} className="adm-btn adm-btn-ghost adm-btn-sm">👁 Ver hilo</Link>
                )}
                {!r.contenidoEliminado && (r.foro_id || r.comentario_id) && (
                  <button type="button" className="adm-btn adm-btn-sm adm-btn-peligro" disabled={ocupado} onClick={() => eliminarContenido(r)}>
                    🗑 {r.comentario_id ? 'Eliminar comentario' : 'Eliminar hilo'}
                  </button>
                )}
                {estId === ESTADOS_REPORTE.PENDIENTE && (
                  <button
                    type="button"
                    className="adm-btn adm-btn-sm adm-btn-advertencia"
                    disabled={ocupado}
                    onClick={() => cambiarEstado(r, ESTADOS_REPORTE.EN_REVISION, 'Reporte en revisión')}
                  >
                    🔎 Poner en revisión
                  </button>
                )}
                {resuelto ? (
                  <button
                    type="button"
                    className="adm-btn adm-btn-ghost adm-btn-sm"
                    disabled={ocupado}
                    onClick={() => cambiarEstado(r, ESTADOS_REPORTE.PENDIENTE, 'Reporte reabierto')}
                  >
                    ↩ Reabrir
                  </button>
                ) : (
                  <button type="button" className="adm-btn adm-btn-secundario adm-btn-sm" disabled={ocupado} onClick={() => resolver(r)}>
                    ✅ Marcar como resuelto
                  </button>
                )}
                <button type="button" className="adm-btn adm-btn-ghost adm-btn-sm" disabled={ocupado} onClick={() => descartar(r)}>
                  Descartar
                </button>
              </div>
            </div>
          );
        })
      )}
    </>
  );
};
