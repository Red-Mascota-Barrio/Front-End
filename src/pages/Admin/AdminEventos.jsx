import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Col, Form, Row, Table } from 'react-bootstrap';
import { adminService, mensajeError, TIPOS_EVENTO } from '../../services/adminService';
import {
  PageHeader, StatCard, Badge, Toolbar, SelectFiltro, TablaCard, TablaFooter,
  EstadoVacio, Cargando, Aviso, AdminModal, ModalAcciones, BotonAccion,
} from '../../components/admin/AdminUI';
import {
  normalizar, fechaCorta, estadoEvento, emojiTipoEvento, claseTipoEvento, rel,
  confirmar, notificarExito, notificarError, usePaginacion,
} from '../../utils/admin';

const FORM_VACIO = { nombre: '', tipo_evento_id: '', fecha_evento: '', hora_evento: '', ubicacion: '', descripcion: '' };

const tipoDe = (e) => rel(e, 'tipo_evento', 'tipoEvento');
const organizadorDe = (e) => rel(e, 'usuario_organizador', 'usuarioOrganizador');

// Valida el formulario con las mismas reglas que EventoController
const validar = (f) => {
  const err = {};
  if (!f.nombre.trim()) err.nombre = 'El nombre es obligatorio.';
  else if (f.nombre.length > 150) err.nombre = 'Máximo 150 caracteres.';
  if (!f.tipo_evento_id) err.tipo_evento_id = 'Selecciona un tipo.';
  if (!f.fecha_evento) err.fecha_evento = 'Indica la fecha.';
  if (!/^\d{2}:\d{2}$/.test(f.hora_evento)) err.hora_evento = 'Indica la hora.';
  if (!f.ubicacion.trim()) err.ubicacion = 'El lugar es obligatorio.';
  if (!f.descripcion.trim()) err.descripcion = 'La descripción es obligatoria.';
  else if (f.descripcion.length > 255) err.descripcion = 'Máximo 255 caracteres.';
  return err;
};

export const AdminEventos = () => {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [modal, setModal] = useState(null); // null | 'nuevo' | evento
  const [form, setForm] = useState(FORM_VACIO);
  const [errores, setErrores] = useState({});
  const [intentado, setIntentado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [recarga, setRecarga] = useState(0);
  const cargar = useCallback(() => {
    setCargando(true);
    setError('');
    setRecarga((n) => n + 1);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setEventos(await adminService.listarEventos());
      } catch (e) {
        setEventos([]);
        setError(mensajeError(e, 'No pudimos cargar los eventos.'));
      } finally {
        setCargando(false);
      }
    })();
  }, [recarga]);

  // Tipos: los del seeder + los que vengan en los eventos
  const tipos = useMemo(() => {
    const mapa = new Map(TIPOS_EVENTO.map((t) => [t.id_tipo_evento, t]));
    eventos.forEach((e) => {
      const t = tipoDe(e);
      if (t?.id_tipo_evento) mapa.set(t.id_tipo_evento, t);
    });
    return [...mapa.values()];
  }, [eventos]);

  const filtrados = useMemo(() => {
    const q = normalizar(busqueda);
    return [...eventos]
      .filter((e) => {
        if (filtroTipo && String(e.tipo_evento_id) !== filtroTipo) return false;
        if (filtroEstado && estadoEvento(e).clave !== filtroEstado) return false;
        if (!q) return true;
        return normalizar(`${e.nombre} ${e.ubicacion} ${e.descripcion}`).includes(q);
      })
      // Próximos primero (por fecha ascendente), luego realizados/cancelados (más recientes primero)
      .sort((a, b) => {
        const pa = estadoEvento(a).clave === 'proximo' ? 0 : 1;
        const pb = estadoEvento(b).clave === 'proximo' ? 0 : 1;
        if (pa !== pb) return pa - pb;
        const cmp = String(a.fecha_evento).localeCompare(String(b.fecha_evento));
        return pa === 0 ? cmp : -cmp;
      });
  }, [eventos, busqueda, filtroTipo, filtroEstado]);

  const { pagina, setPagina, totalPaginas, visibles } = usePaginacion(filtrados, 10);

  const stats = useMemo(() => {
    const cuenta = (clave) => eventos.filter((e) => estadoEvento(e).clave === clave).length;
    return {
      total: eventos.length,
      proximos: cuenta('proximo'),
      inscritos: eventos.reduce((s, e) => s + Number(e.total_inscritos ?? 0), 0),
      realizados: cuenta('realizado'),
    };
  }, [eventos]);

  const abrirNuevo = () => {
    setForm(FORM_VACIO);
    setErrores({});
    setIntentado(false);
    setModal('nuevo');
  };

  const abrirEdicion = (e) => {
    setForm({
      nombre: e.nombre ?? '',
      tipo_evento_id: String(e.tipo_evento_id ?? ''),
      fecha_evento: String(e.fecha_evento ?? '').slice(0, 10),
      hora_evento: String(e.hora_evento ?? '').slice(0, 5),
      ubicacion: e.ubicacion ?? '',
      descripcion: e.descripcion ?? '',
    });
    setErrores({});
    setIntentado(false);
    setModal(e);
  };

  const campo = (k) => (ev) => {
    const nuevo = { ...form, [k]: ev.target.value };
    setForm(nuevo);
    if (intentado) setErrores(validar(nuevo));
  };

  const guardar = async (ev) => {
    ev.preventDefault();
    setIntentado(true);
    const err = validar(form);
    setErrores(err);
    if (Object.keys(err).length) return;

    setGuardando(true);
    const payload = { ...form, tipo_evento_id: Number(form.tipo_evento_id) };
    try {
      if (modal === 'nuevo') {
        await adminService.crearEvento(payload);
        notificarExito('Evento creado');
      } else {
        await adminService.actualizarEvento(modal.id_evento, payload);
        notificarExito('Evento actualizado');
      }
      setModal(null);
      cargar();
    } catch (e) {
      const errApi = e?.response?.data?.error;
      if (errApi && typeof errApi === 'object') {
        setErrores(Object.fromEntries(Object.entries(errApi).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])));
      }
      notificarError('No se pudo guardar el evento', mensajeError(e));
    } finally {
      setGuardando(false);
    }
  };

  const alternarEstado = async (e) => {
    const cancelado = estadoEvento(e).clave === 'cancelado';
    const ok = await confirmar({
      titulo: cancelado ? `¿Reactivar "${e.nombre}"?` : `¿Cancelar "${e.nombre}"?`,
      texto: 'Se notificará a las personas inscritas.',
      boton: cancelado ? 'Reactivar' : 'Cancelar evento',
      peligro: !cancelado,
    });
    if (!ok) return;
    const nuevoEstado = cancelado ? 'Activo' : 'Inactivo';
    try {
      await adminService.actualizarEvento(e.id_evento, { estado_evento: nuevoEstado });
      setEventos((lista) => lista.map((x) => (x.id_evento === e.id_evento ? { ...x, estado_evento: nuevoEstado } : x)));
      notificarExito(cancelado ? 'Evento reactivado' : 'Evento cancelado');
    } catch (err) {
      notificarError('No se pudo cambiar el estado', mensajeError(err));
    }
  };

  const eliminar = async (e) => {
    const ok = await confirmar({
      titulo: `¿Eliminar "${e.nombre}"?`,
      texto: 'Se notificará a los inscritos. Esta acción no se puede deshacer.',
      boton: 'Eliminar',
      peligro: true,
    });
    if (!ok) return;
    try {
      await adminService.eliminarEvento(e.id_evento);
      setEventos((lista) => lista.filter((x) => x.id_evento !== e.id_evento));
      notificarExito('Evento eliminado');
    } catch (err) {
      notificarError('No se pudo eliminar', mensajeError(err));
    }
  };

  // Props comunes de cada campo: valor, cambio y estado de error de Bootstrap
  const props = (k) => ({ value: form[k], onChange: campo(k), isInvalid: Boolean(errores[k]) });
  const errorDe = (k) => <Form.Control.Feedback type="invalid">{errores[k]}</Form.Control.Feedback>;

  return (
    <>
      <PageHeader
        titulo="Gestión de eventos"
        subtitulo={cargando ? 'Cargando eventos…' : `${stats.total} eventos creados en la plataforma`}
      >
        <Button variant="outline-secondary" size="sm" onClick={cargar} disabled={cargando}>
          <i className="bi bi-arrow-clockwise me-1" /> Actualizar
        </Button>
        <Button variant="success" size="sm" onClick={abrirNuevo}>
          <i className="bi bi-plus-lg me-1" /> Crear evento
        </Button>
      </PageHeader>

      <Row xs={1} sm={2} xl={4} className="g-3 mb-4">
        <Col><StatCard icono="calendario" numero={stats.total} label="Total eventos" cargando={cargando} /></Col>
        <Col><StatCard icono="reloj" numero={stats.proximos} label="Próximos" cargando={cargando} /></Col>
        <Col><StatCard icono="usuario" numero={stats.inscritos} label="Inscritos" cargando={cargando} /></Col>
        <Col><StatCard icono="pulso" numero={stats.realizados} label="Realizados" cargando={cargando} /></Col>
      </Row>

      {error && <Aviso tipo="error">{error}</Aviso>}

      <Toolbar busqueda={busqueda} onBusqueda={setBusqueda} placeholder="Buscar evento por nombre o lugar…">
        <SelectFiltro
          label="Filtrar por tipo"
          value={filtroTipo}
          onChange={setFiltroTipo}
          opciones={[
            { value: '', label: 'Todos los tipos' },
            ...tipos.map((t) => ({ value: String(t.id_tipo_evento), label: t.nombre_tipo })),
          ]}
        />
        <SelectFiltro
          label="Filtrar por estado"
          value={filtroEstado}
          onChange={setFiltroEstado}
          opciones={[
            { value: '', label: 'Todos los estados' },
            { value: 'proximo', label: 'Próximo' },
            { value: 'realizado', label: 'Realizado' },
            { value: 'cancelado', label: 'Cancelado' },
          ]}
        />
      </Toolbar>

      <TablaCard>
        {cargando ? (
          <Cargando texto="Cargando eventos…" />
        ) : filtrados.length === 0 ? (
          <EstadoVacio
            icono={eventos.length ? '🔍' : '📅'}
            titulo={eventos.length ? 'Sin resultados' : 'Aún no hay eventos'}
            sub={eventos.length ? 'Prueba con otra búsqueda o filtro.' : 'Crea el primero con “Crear evento”.'}
          />
        ) : (
          <>
            <Table hover responsive className="align-middle mb-0 small">
              <thead className="table-light">
                <tr>
                  <th>Evento</th>
                  <th>Tipo</th>
                  <th>Fecha</th>
                  <th>Lugar</th>
                  <th>Inscritos</th>
                  <th>Estado</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((e) => {
                  const tipo = tipoDe(e)?.nombre_tipo ?? tipos.find((t) => t.id_tipo_evento === Number(e.tipo_evento_id))?.nombre_tipo ?? '—';
                  const est = estadoEvento(e);
                  const org = organizadorDe(e);
                  return (
                    <tr key={e.id_evento}>
                      <td style={{ minWidth: 200 }}>
                        <div className="fw-semibold">{e.nombre}</div>
                        <div className="text-secondary text-truncate" style={{ fontSize: '.75rem', maxWidth: 280 }}>
                          {org ? `Organiza: ${org.nombre} ${org.apellido ?? ''}` : e.descripcion}
                        </div>
                      </td>
                      <td><Badge variante={claseTipoEvento(tipo)}>{emojiTipoEvento(tipo)} {tipo}</Badge></td>
                      <td className="text-secondary text-nowrap">
                        {fechaCorta(e.fecha_evento)}
                        <div className="text-body-tertiary" style={{ fontSize: '.75rem' }}>{String(e.hora_evento ?? '').slice(0, 5)}</div>
                      </td>
                      <td className="text-body-tertiary">{e.ubicacion}</td>
                      <td className="fw-semibold">{Number(e.total_inscritos ?? 0)}</td>
                      <td><Badge variante={est.clase}>{est.texto}</Badge></td>
                      <td>
                        <div className="d-flex justify-content-end gap-1">
                          <BotonAccion icono="editar" titulo="Editar" onClick={() => abrirEdicion(e)} />
                          <BotonAccion
                            icono={est.clave === 'cancelado' ? 'play' : 'pausa'}
                            titulo={est.clave === 'cancelado' ? 'Reactivar' : 'Cancelar'}
                            onClick={() => alternarEstado(e)}
                          />
                          <BotonAccion icono="eliminar" titulo="Eliminar" peligro onClick={() => eliminar(e)} />
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
              nombre="eventos"
              pagina={pagina}
              totalPaginas={totalPaginas}
              onPagina={setPagina}
            />
          </>
        )}
      </TablaCard>

      <AdminModal
        abierto={Boolean(modal)}
        titulo={modal === 'nuevo' ? '📅 Nuevo evento' : '✏️ Editar evento'}
        onCerrar={() => setModal(null)}
      >
        <Form onSubmit={guardar} noValidate>
          <Row className="g-3">
            <Form.Group as={Col} xs={12} controlId="evNombre">
              <Form.Label>Nombre del evento</Form.Label>
              <Form.Control placeholder="Ej: Jornada de vacunación" maxLength={150} {...props('nombre')} />
              {errorDe('nombre')}
            </Form.Group>
            <Form.Group as={Col} xs={12} controlId="evTipo">
              <Form.Label>Tipo</Form.Label>
              <Form.Select {...props('tipo_evento_id')}>
                <option value="">Selecciona…</option>
                {tipos.map((t) => (
                  <option key={t.id_tipo_evento} value={t.id_tipo_evento}>
                    {emojiTipoEvento(t.nombre_tipo)} {t.nombre_tipo}
                  </option>
                ))}
              </Form.Select>
              {errorDe('tipo_evento_id')}
            </Form.Group>
            <Form.Group as={Col} sm={6} controlId="evFecha">
              <Form.Label>Fecha</Form.Label>
              <Form.Control type="date" {...props('fecha_evento')} />
              {errorDe('fecha_evento')}
            </Form.Group>
            <Form.Group as={Col} sm={6} controlId="evHora">
              <Form.Label>Hora</Form.Label>
              <Form.Control type="time" {...props('hora_evento')} />
              {errorDe('hora_evento')}
            </Form.Group>
            <Form.Group as={Col} xs={12} controlId="evLugar">
              <Form.Label>Lugar</Form.Label>
              <Form.Control placeholder="Parque, salón, dirección…" maxLength={150} {...props('ubicacion')} />
              {errorDe('ubicacion')}
            </Form.Group>
            <Form.Group as={Col} xs={12} controlId="evDescripcion">
              <Form.Label>Descripción <span className="text-secondary small">({form.descripcion.length}/255)</span></Form.Label>
              <Form.Control as="textarea" rows={3} placeholder="Detalles del evento, requisitos, contacto…" maxLength={255} {...props('descripcion')} />
              {errorDe('descripcion')}
            </Form.Group>
          </Row>
          <ModalAcciones>
            <Button variant="outline-secondary" onClick={() => setModal(null)}>Cancelar</Button>
            <Button type="submit" variant="success" disabled={guardando}>
              {guardando ? 'Guardando…' : modal === 'nuevo' ? 'Crear evento' : 'Guardar cambios'}
            </Button>
          </ModalAcciones>
        </Form>
      </AdminModal>
    </>
  );
};
