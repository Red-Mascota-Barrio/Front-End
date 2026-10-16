import { useEffect, useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Button, Card, Col, ListGroup, Row, Table } from 'react-bootstrap';
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
        color: estadoReporteId(r) === ESTADOS_REPORTE.RESUELTO ? 'success' : 'danger',
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
        color: est.clave === 'cancelado' ? 'warning' : 'success',
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
        <Button as={Link} to="/admin/reportes" variant="outline-danger" size="sm">
          <i className="bi bi-exclamation-triangle me-1" /> Revisar reportes ({pendientes})
        </Button>
      </PageHeader>

      <Row xs={1} sm={2} xl={4} className="g-3 mb-4">
        <Col><StatCard icono="usuarios" numero={stats?.usuarios} label="Usuarios" cargando={cargando} /></Col>
        <Col><StatCard icono="corazon" numero={stats?.mascotas ?? mascotas.length} label="Mascotas" cargando={cargando} /></Col>
        <Col><StatCard icono="pulso" numero={stats?.adopciones} label="Adopciones" cargando={cargando} /></Col>
        <Col><StatCard icono="alerta" numero={pendientes} label="Reportes pendientes" alerta cargando={cargando} /></Col>
      </Row>

      <Row xs={1} lg={2} className="g-3 mb-4">
        {/* Actividad reciente */}
        <Col>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center py-3">
              <h2 className="h6 fw-bold mb-0 adm-titulo">Actividad reciente</h2>
              <Badge variante="success">En vivo</Badge>
            </Card.Header>
            {cargando ? (
              <Cargando />
            ) : actividad.length === 0 ? (
              <EstadoVacio icono="🌿" titulo="Sin actividad" sub="Aún no hay reportes ni eventos recientes." />
            ) : (
              <ListGroup variant="flush">
                {actividad.map((a) => (
                  <ListGroup.Item key={a.id} className="d-flex align-items-center gap-3 py-3">
                    <span className={`adm-punto rounded-circle bg-${a.color}`} />
                    <div className="small text-secondary flex-grow-1">{a.texto}</div>
                    <small className="text-body-tertiary text-nowrap">{haceCuanto(a.fecha)}</small>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Card>
        </Col>

        {/* Mascotas recientes */}
        <Col>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center py-3">
              <h2 className="h6 fw-bold mb-0 adm-titulo">Mascotas recientes</h2>
              <Link to="/admin/mascotas" className="small fw-semibold link-success text-decoration-none">
                Ver todas <i className="bi bi-arrow-right" />
              </Link>
            </Card.Header>
            {cargando ? (
              <Cargando />
            ) : mascotasRecientes.length === 0 ? (
              <EstadoVacio icono="🐾" titulo="Sin mascotas" sub="Todavía no hay mascotas registradas." />
            ) : (
              <Table hover className="align-middle mb-0 small">
                <tbody>
                  {mascotasRecientes.map((m) => {
                    const est = estadoMascota(m);
                    return (
                      <tr key={m.id_mascotas}>
                        <td>
                          <div className="fw-semibold">{m.nombre}</div>
                          <div className="text-secondary small">
                            {[especieDeMascota(m), m.edad_estimada].filter(Boolean).join(' · ') || '—'}
                          </div>
                        </td>
                        <td><Badge variante={est.clase}>{est.texto}</Badge></td>
                        <td className="text-end text-secondary text-nowrap">
                          {m.genero ? m.genero.charAt(0).toUpperCase() + m.genero.slice(1) : ''}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </Card>
        </Col>
      </Row>

      {/* Acciones rápidas */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <h2 className="h6 fw-bold mb-3 adm-titulo">Acciones rápidas</h2>
          <div className="d-flex flex-wrap gap-2">
            <Button as={Link} to="/admin/usuarios" variant="outline-success" size="sm">👥 Gestionar usuarios</Button>
            <Button as={Link} to="/admin/mascotas" variant="outline-success" size="sm">🐾 Gestionar mascotas</Button>
            <Button as={Link} to="/admin/eventos" variant="outline-success" size="sm">📅 Gestionar eventos</Button>
            <Button as={Link} to="/foro" variant="outline-success" size="sm">💬 Moderar foros</Button>
            <Button as={Link} to="/admin/reportes" variant="outline-danger" size="sm">
              ⚠️ Reportes pendientes ({pendientes})
            </Button>
          </div>
        </Card.Body>
      </Card>
    </>
  );
};
