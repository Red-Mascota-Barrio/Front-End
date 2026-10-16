import { useEffect, useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { adminService, ESTADOS_REPORTE } from '../../services/adminService';
import { PageHeader, StatCard, Badge, EstadoVacio, Cargando } from '../../components/admin/AdminUI';
import {
  aFecha, haceCuanto, fechaLarga, estadoMascota, especieDeMascota,
  estadoReporteId, rel, estadoEvento,
} from '../../utils/admin';

// Ejecuta la promesa y devuelve null si falla (el dashboard no debe romperse por un módulo)
const seguro = (p) => p.catch(() => null);

export const AdminDashboard = () => {
  const { reportesPendientes } = useOutletContext() ?? {};
  const [cargando, setCargando] = useState(true);
  const [stats, setStats] = useState(null);
  const [mascotas, setMascotas] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [reportes, setReportes] = useState([]);

  useEffect(() => {
    let activo = true;
    (async () => {
      const [s, m, e, r] = await Promise.all([
        seguro(adminService.estadisticas()),
        seguro(adminService.listarMascotas()),
        seguro(adminService.listarEventos()),
        seguro(adminService.listarReportes()),
      ]);
      if (!activo) return;
      setStats(s);
      setMascotas(m ?? []);
      setEventos(e ?? []);
      setReportes(r ?? []);
      setCargando(false);
    })();
    return () => { activo = false; };
  }, []);

  const pendientes = reportesPendientes ?? reportes.filter((r) => estadoReporteId(r) !== ESTADOS_REPORTE.RESUELTO).length;

  // Últimas mascotas registradas (id más alto = más reciente)
  const mascotasRecientes = useMemo(
    () => [...mascotas].sort((a, b) => (b.id_mascotas ?? 0) - (a.id_mascotas ?? 0)).slice(0, 4),
    [mascotas],
  );

  // Actividad reciente: mezcla reportes y eventos ordenados por fecha
  const actividad = useMemo(() => {
    const items = [];
    reportes.forEach((r) => {
      const reportado = rel(r, 'usuario_reportado', 'usuarioReportado');
      const foro = r.foro?.titulo;
      items.push({
        id: `r-${r.id_reporte}`,
        fecha: aFecha(r.fecha_reporte),
        punto: estadoReporteId(r) === ESTADOS_REPORTE.RESUELTO ? 'claro' : 'rojo',
        texto: (
          <>
            Reporte {foro ? <>en el hilo <strong>“{foro}”</strong></> : 'en el foro'}
            {reportado && <> contra <strong>{reportado.nombre}</strong></>}
          </>
        ),
      });
    });
    eventos.forEach((e) => {
      const est = estadoEvento(e);
      items.push({
        id: `e-${e.id_evento}`,
        fecha: aFecha(e.fecha_actualizacion ?? e.fecha_evento),
        punto: est.clave === 'cancelado' ? 'naranja' : '',
        texto: (
          <>
            Evento <strong>“{e.nombre}”</strong> {est.clave === 'cancelado' ? 'cancelado' : 'programado'}
          </>
        ),
      });
    });
    return items
      .filter((i) => i.fecha)
      .sort((a, b) => b.fecha - a.fecha)
      .slice(0, 5);
  }, [reportes, eventos]);

  return (
    <>
      <PageHeader titulo="Panel Administrativo" subtitulo={`Resumen general de la plataforma · ${fechaLarga()}`}>
        <Link to="/admin/reportes" className="adm-btn adm-btn-ghost adm-btn-sm adm-btn-alerta">
          ⚠️ Revisar reportes ({pendientes})
        </Link>
      </PageHeader>

      <div className="adm-grid-4 adm-mb-lg">
        <StatCard icono="usuarios" numero={stats?.usuarios} label="Usuarios" cargando={cargando} />
        <StatCard icono="corazon" numero={stats?.mascotas ?? mascotas.length} label="Mascotas" cargando={cargando} />
        <StatCard icono="pulso" numero={stats?.adopciones} label="Adopciones" cargando={cargando} />
        <StatCard icono="alerta" numero={pendientes} label="Reportes pendientes" alerta cargando={cargando} />
      </div>

      <div className="adm-grid-2 adm-mb-lg">
        {/* Actividad reciente */}
        <div className="adm-tarjeta">
          <div className="adm-tarjeta-header">
            <h3 className="adm-tarjeta-titulo">Actividad reciente</h3>
            <Badge clase="adm-badge-verde">En vivo</Badge>
          </div>
          {cargando ? (
            <Cargando />
          ) : actividad.length === 0 ? (
            <EstadoVacio icono="🌿" titulo="Sin actividad" sub="Aún no hay reportes ni eventos recientes." />
          ) : (
            actividad.map((a) => (
              <div key={a.id} className="adm-actividad-item">
                <div className={`adm-actividad-punto ${a.punto}`} />
                <div className="adm-actividad-texto">{a.texto}</div>
                <div className="adm-actividad-hora">{haceCuanto(a.fecha)}</div>
              </div>
            ))
          )}
        </div>

        {/* Mascotas recientes */}
        <div className="adm-tarjeta">
          <div className="adm-tarjeta-header">
            <h3 className="adm-tarjeta-titulo">Mascotas recientes</h3>
            <Link to="/admin/mascotas" className="adm-tarjeta-link">Ver todas →</Link>
          </div>
          {cargando ? (
            <Cargando />
          ) : mascotasRecientes.length === 0 ? (
            <EstadoVacio icono="🐾" titulo="Sin mascotas" sub="Todavía no hay mascotas registradas." />
          ) : (
            <table className="adm-mini-tabla">
              <tbody>
                {mascotasRecientes.map((m) => {
                  const est = estadoMascota(m);
                  return (
                    <tr key={m.id_mascotas}>
                      <td>
                        <strong>{m.nombre}</strong>
                        <br />
                        <span className="adm-mini-sub">
                          {[especieDeMascota(m), m.edad_estimada].filter(Boolean).join(' · ') || '—'}
                        </span>
                      </td>
                      <td><Badge clase={est.clase}>{est.texto}</Badge></td>
                      <td className="adm-mini-hora">{m.genero ? m.genero.charAt(0).toUpperCase() + m.genero.slice(1) : ''}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="adm-tarjeta">
        <h3 className="adm-tarjeta-titulo" style={{ marginBottom: 16 }}>Acciones rápidas</h3>
        <div className="adm-acciones-lista">
          <Link to="/admin/usuarios" className="adm-btn adm-btn-secundario adm-btn-sm">👥 Gestionar usuarios</Link>
          <Link to="/admin/mascotas" className="adm-btn adm-btn-secundario adm-btn-sm">🐾 Gestionar mascotas</Link>
          <Link to="/admin/eventos" className="adm-btn adm-btn-secundario adm-btn-sm">📅 Gestionar eventos</Link>
          <Link to="/foro" className="adm-btn adm-btn-secundario adm-btn-sm">💬 Moderar foros</Link>
          <Link to="/admin/reportes" className="adm-btn adm-btn-ghost adm-btn-sm adm-btn-alerta">
            ⚠️ Reportes pendientes ({pendientes})
          </Link>
        </div>
      </div>
    </>
  );
};
