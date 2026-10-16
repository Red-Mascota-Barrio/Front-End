import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Col, Form, Row, Table } from 'react-bootstrap';
import { adminService, mensajeError, ROLES } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import {
  PageHeader, StatCard, Badge, Toolbar, SelectFiltro, TablaCard, TablaFooter,
  EstadoVacio, Cargando, Aviso, AdminModal, ModalAcciones, BotonAccion,
} from '../../components/admin/AdminUI';
import {
  fechaCorta, iniciales, claseAvatar, normalizar, rolDeUsuario, usuarioActivo,
  confirmar, notificarExito, notificarError, usePaginacion, aFecha,
} from '../../utils/admin';
import { urlFoto } from '../../services/mascotasService';

const FORM_VACIO = { nombre: '', apellido: '', telefono: '', barrio: '', ciudad: '', rol_id: 2, estado: 1 };

export const AdminUsuarios = () => {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(FORM_VACIO);
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
        setUsuarios(await adminService.listarUsuarios());
      } catch (e) {
        setUsuarios([]);
        setError(mensajeError(e, 'No pudimos cargar los usuarios.'));
      } finally {
        setCargando(false);
      }
    })();
  }, [recarga]);

  const filtrados = useMemo(() => {
    const q = normalizar(busqueda);
    return usuarios.filter((u) => {
      const rol = rolDeUsuario(u);
      const activo = usuarioActivo(u);
      if (filtroRol && String(rol.id) !== filtroRol) return false;
      if (filtroEstado === 'activo' && !activo) return false;
      if (filtroEstado === 'inactivo' && activo) return false;
      if (!q) return true;
      return normalizar(`${u.nombre} ${u.apellido} ${u.correo} ${u.barrio} ${u.ciudad}`).includes(q);
    });
  }, [usuarios, busqueda, filtroRol, filtroEstado]);

  const { pagina, setPagina, totalPaginas, visibles } = usePaginacion(filtrados, 10);

  const stats = useMemo(() => {
    const hoy = new Date().toDateString();
    return {
      total: usuarios.length,
      activos: usuarios.filter(usuarioActivo).length,
      nuevosHoy: usuarios.filter((u) => aFecha(u.fecha_registro)?.toDateString() === hoy).length,
      admins: usuarios.filter((u) => rolDeUsuario(u).esAdmin).length,
    };
  }, [usuarios]);

  const abrirEdicion = (u) => {
    setEditando(u);
    setForm({
      nombre: u.nombre ?? '',
      apellido: u.apellido ?? '',
      telefono: u.telefono ?? '',
      barrio: u.barrio ?? '',
      ciudad: u.ciudad ?? '',
      rol_id: rolDeUsuario(u).id,
      estado: usuarioActivo(u) ? 1 : 0,
    });
  };

  const guardar = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    setGuardando(true);
    try {
      const payload = { ...form, nombre: form.nombre.trim(), rol_id: Number(form.rol_id), estado: Number(form.estado) };
      // "apellido" es obligatorio en la BD: si viene vacío no lo enviamos
      if (!form.apellido.trim()) delete payload.apellido;
      const actualizado = await adminService.actualizarUsuario(editando.id_usuario, payload);
      setUsuarios((lista) =>
        lista.map((u) => (u.id_usuario === editando.id_usuario ? { ...u, ...payload, ...(actualizado ?? {}) } : u)),
      );
      setEditando(null);
      notificarExito('Usuario actualizado');
    } catch (err) {
      notificarError('No se pudo guardar', mensajeError(err));
    } finally {
      setGuardando(false);
    }
  };

  const alternarEstado = async (u) => {
    const activo = usuarioActivo(u);
    const ok = await confirmar({
      titulo: activo ? `¿Desactivar a ${u.nombre}?` : `¿Reactivar a ${u.nombre}?`,
      texto: activo ? 'El usuario no podrá iniciar sesión mientras esté inactivo.' : 'El usuario podrá volver a usar la plataforma.',
      boton: activo ? 'Desactivar' : 'Reactivar',
      peligro: activo,
    });
    if (!ok) return;
    try {
      await adminService.actualizarUsuario(u.id_usuario, { estado: activo ? 0 : 1 });
      setUsuarios((lista) => lista.map((x) => (x.id_usuario === u.id_usuario ? { ...x, estado: activo ? 0 : 1 } : x)));
      notificarExito(activo ? 'Usuario desactivado' : 'Usuario reactivado');
    } catch (err) {
      notificarError('No se pudo cambiar el estado', mensajeError(err));
    }
  };

  const eliminar = async (u) => {
    const ok = await confirmar({
      titulo: `¿Eliminar a ${u.nombre} ${u.apellido ?? ''}?`,
      texto: 'Esta acción no se puede deshacer.',
      boton: 'Eliminar',
      peligro: true,
    });
    if (!ok) return;
    try {
      await adminService.eliminarUsuario(u.id_usuario);
      setUsuarios((lista) => lista.filter((x) => x.id_usuario !== u.id_usuario));
      notificarExito('Usuario eliminado');
    } catch (err) {
      notificarError('No se pudo eliminar', mensajeError(err));
    }
  };

  const esYo = (u) => user && Number(u.id_usuario) === Number(user.id_usuario ?? user.id);
  const campo = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <>
      <PageHeader
        titulo="Gestión de usuarios"
        subtitulo={cargando ? 'Cargando usuarios…' : `${stats.total.toLocaleString('es-CO')} usuarios registrados en la plataforma`}
      >
        <Button variant="outline-secondary" size="sm" onClick={cargar} disabled={cargando}>
          <i className="bi bi-arrow-clockwise me-1" /> Actualizar
        </Button>
      </PageHeader>

      <Row xs={1} sm={2} xl={4} className="g-3 mb-4">
        <Col><StatCard icono="usuario" numero={stats.total} label="Total usuarios" cargando={cargando} /></Col>
        <Col><StatCard icono="check" numero={stats.activos} label="Activos" cargando={cargando} /></Col>
        <Col><StatCard icono="info" numero={stats.nuevosHoy} label="Nuevos hoy" cargando={cargando} /></Col>
        <Col><StatCard icono="escudo" numero={stats.admins} label="Admins" cargando={cargando} /></Col>
      </Row>

      {error && (
        <Aviso tipo="error">
          {error} Verifica que la API exponga <code>GET /api/usuarios</code> para administradores.
        </Aviso>
      )}

      <Toolbar busqueda={busqueda} onBusqueda={setBusqueda} placeholder="Buscar por nombre, correo o barrio…">
        <SelectFiltro
          label="Filtrar por rol"
          value={filtroRol}
          onChange={setFiltroRol}
          opciones={[{ value: '', label: 'Todos los roles' }, ...ROLES.map((r) => ({ value: String(r.id), label: r.nombre }))]}
        />
        <SelectFiltro
          label="Filtrar por estado"
          value={filtroEstado}
          onChange={setFiltroEstado}
          opciones={[
            { value: '', label: 'Todos los estados' },
            { value: 'activo', label: 'Activo' },
            { value: 'inactivo', label: 'Inactivo' },
          ]}
        />
      </Toolbar>

      <TablaCard>
        {cargando ? (
          <Cargando texto="Cargando usuarios…" />
        ) : filtrados.length === 0 ? (
          <EstadoVacio
            icono={usuarios.length ? '🔍' : '👥'}
            titulo={usuarios.length ? 'Sin resultados' : 'No hay usuarios para mostrar'}
            sub={usuarios.length ? 'Prueba con otra búsqueda o filtro.' : undefined}
          />
        ) : (
          <>
            <Table hover responsive className="align-middle mb-0 small">
              <thead className="table-light">
                <tr>
                  <th>Usuario</th>
                  <th>Barrio</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Registro</th>
                  <th>Verificado</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((u) => {
                  const rol = rolDeUsuario(u);
                  const activo = usuarioActivo(u);
                  return (
                    <tr key={u.id_usuario}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className={`adm-avatar rounded-circle text-white fw-bold ${claseAvatar(u.id_usuario)}`}>
                            {u.foto_perfil ? <img src={urlFoto(u.foto_perfil)} alt="" /> : iniciales(u.nombre, u.apellido)}
                          </div>
                          <div>
                            <div className="fw-semibold">
                              {u.nombre} {u.apellido} {esYo(u) && <Badge variante="success">Tú</Badge>}
                            </div>
                            <div className="text-secondary" style={{ fontSize: '.75rem' }}>{u.correo}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-secondary">{u.barrio || '—'}</td>
                      <td><Badge variante={rol.esAdmin ? 'success' : 'primary'}>{rol.etiqueta}</Badge></td>
                      <td><Badge variante={activo ? 'success' : 'danger'}>{activo ? 'Activo' : 'Inactivo'}</Badge></td>
                      <td className="text-body-tertiary text-nowrap">{fechaCorta(u.fecha_registro)}</td>
                      <td className="text-secondary text-nowrap">
                        {Number(u.cuenta_verificada)
                          ? <><i className="bi bi-patch-check-fill text-success me-1" />Sí</>
                          : '— No'}
                      </td>
                      <td>
                        <div className="d-flex justify-content-end gap-1">
                          <BotonAccion icono="editar" titulo="Editar" onClick={() => abrirEdicion(u)} />
                          <BotonAccion
                            icono={activo ? 'pausa' : 'play'}
                            titulo={activo ? 'Desactivar' : 'Reactivar'}
                            onClick={() => alternarEstado(u)}
                            disabled={esYo(u)}
                          />
                          <BotonAccion icono="eliminar" titulo="Eliminar" peligro onClick={() => eliminar(u)} disabled={esYo(u)} />
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
              nombre="usuarios"
              pagina={pagina}
              totalPaginas={totalPaginas}
              onPagina={setPagina}
            />
          </>
        )}
      </TablaCard>

      <AdminModal abierto={Boolean(editando)} titulo="✏️ Editar usuario" onCerrar={() => setEditando(null)}>
        <Form onSubmit={guardar} noValidate>
          <Row className="g-3">
            <Form.Group as={Col} sm={6} controlId="uNombre">
              <Form.Label>Nombre</Form.Label>
              <Form.Control value={form.nombre} onChange={campo('nombre')} isInvalid={!form.nombre.trim()} required />
              <Form.Control.Feedback type="invalid">El nombre es obligatorio.</Form.Control.Feedback>
            </Form.Group>
            <Form.Group as={Col} sm={6} controlId="uApellido">
              <Form.Label>Apellido</Form.Label>
              <Form.Control value={form.apellido} onChange={campo('apellido')} />
            </Form.Group>
            <Form.Group as={Col} xs={12} controlId="uCorreo">
              <Form.Label>Correo electrónico</Form.Label>
              <Form.Control value={editando?.correo ?? ''} disabled />
            </Form.Group>
            <Form.Group as={Col} sm={6} controlId="uTelefono">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control value={form.telefono} onChange={campo('telefono')} />
            </Form.Group>
            <Form.Group as={Col} sm={6} controlId="uBarrio">
              <Form.Label>Barrio</Form.Label>
              <Form.Control value={form.barrio} onChange={campo('barrio')} />
            </Form.Group>
            <Form.Group as={Col} sm={6} controlId="uRol">
              <Form.Label>Rol</Form.Label>
              <Form.Select value={form.rol_id} onChange={campo('rol_id')} disabled={editando && esYo(editando)}>
                {ROLES.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group as={Col} sm={6} controlId="uEstado">
              <Form.Label>Estado</Form.Label>
              <Form.Select value={form.estado} onChange={campo('estado')} disabled={editando && esYo(editando)}>
                <option value={1}>Activo</option>
                <option value={0}>Inactivo</option>
              </Form.Select>
            </Form.Group>
          </Row>
          <ModalAcciones>
            <Button variant="outline-secondary" onClick={() => setEditando(null)}>Cancelar</Button>
            <Button type="submit" variant="success" disabled={guardando || !form.nombre.trim()}>
              {guardando ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </ModalAcciones>
        </Form>
      </AdminModal>
    </>
  );
};
