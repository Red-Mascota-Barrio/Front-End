import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminService, mensajeError, ROLES } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import {
  PageHeader, StatCard, Badge, Toolbar, SelectFiltro, TablaFooter,
  EstadoVacio, Cargando, Aviso, AdminModal,
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
        <button type="button" className="adm-btn adm-btn-ghost adm-btn-sm" onClick={cargar} disabled={cargando}>
          ↻ Actualizar
        </button>
      </PageHeader>

      <div className="adm-grid-4 adm-mb-md">
        <StatCard icono="usuario" numero={stats.total} label="Total usuarios" cargando={cargando} />
        <StatCard icono="check" numero={stats.activos} label="Activos" cargando={cargando} />
        <StatCard icono="info" numero={stats.nuevosHoy} label="Nuevos hoy" cargando={cargando} />
        <StatCard icono="escudo" numero={stats.admins} label="Admins" cargando={cargando} />
      </div>

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

      <div className="adm-tabla-wrap">
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
            <div className="adm-tabla-scroll">
              <table className="adm-tabla">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Barrio</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Registro</th>
                    <th>Verificado</th>
                    <th className="th-derecha">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {visibles.map((u) => {
                    const rol = rolDeUsuario(u);
                    const activo = usuarioActivo(u);
                    return (
                      <tr key={u.id_usuario}>
                        <td>
                          <div className="adm-tabla-usuario">
                            <div className={`adm-tabla-avatar ${claseAvatar(u.id_usuario)}`}>
                              {u.foto_perfil ? <img src={urlFoto(u.foto_perfil)} alt="" /> : iniciales(u.nombre, u.apellido)}
                            </div>
                            <div>
                              <div className="adm-tabla-nombre">
                                {u.nombre} {u.apellido} {esYo(u) && <Badge clase="adm-badge-verde">Tú</Badge>}
                              </div>
                              <div className="adm-tabla-sub">{u.correo}</div>
                            </div>
                          </div>
                        </td>
                        <td className="adm-td-sec">{u.barrio || '—'}</td>
                        <td><Badge clase={rol.esAdmin ? 'adm-badge-verde' : 'adm-badge-azul'}>{rol.etiqueta}</Badge></td>
                        <td><Badge clase={activo ? 'adm-badge-verde' : 'adm-badge-rojo'}>{activo ? 'Activo' : 'Inactivo'}</Badge></td>
                        <td className="adm-td-tenue">{fechaCorta(u.fecha_registro)}</td>
                        <td className="adm-td-sec">{Number(u.cuenta_verificada) ? '✅ Sí' : '— No'}</td>
                        <td>
                          <div className="adm-acciones-tabla">
                            <button type="button" className="adm-accion-btn" title="Editar" onClick={() => abrirEdicion(u)}>✏️</button>
                            <button
                              type="button"
                              className="adm-accion-btn"
                              title={activo ? 'Desactivar' : 'Reactivar'}
                              onClick={() => alternarEstado(u)}
                              disabled={esYo(u)}
                            >
                              {activo ? '⏸' : '▶️'}
                            </button>
                            <button
                              type="button"
                              className="adm-accion-btn peligro"
                              title="Eliminar"
                              onClick={() => eliminar(u)}
                              disabled={esYo(u)}
                            >
                              🗑
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
      </div>

      <AdminModal abierto={Boolean(editando)} titulo="✏️ Editar usuario" onCerrar={() => setEditando(null)}>
        <form onSubmit={guardar} noValidate>
          <div className="adm-form-grid-2">
            <div className="adm-grupo-campo">
              <label htmlFor="uNombre">Nombre</label>
              <input id="uNombre" className={`adm-campo${!form.nombre.trim() ? ' error' : ''}`} value={form.nombre} onChange={campo('nombre')} required />
            </div>
            <div className="adm-grupo-campo">
              <label htmlFor="uApellido">Apellido</label>
              <input id="uApellido" className="adm-campo" value={form.apellido} onChange={campo('apellido')} />
            </div>
          </div>
          <div className="adm-grupo-campo">
            <label htmlFor="uCorreo">Correo electrónico</label>
            <input id="uCorreo" className="adm-campo" value={editando?.correo ?? ''} disabled />
          </div>
          <div className="adm-form-grid-2">
            <div className="adm-grupo-campo">
              <label htmlFor="uTelefono">Teléfono</label>
              <input id="uTelefono" className="adm-campo" value={form.telefono} onChange={campo('telefono')} />
            </div>
            <div className="adm-grupo-campo">
              <label htmlFor="uBarrio">Barrio</label>
              <input id="uBarrio" className="adm-campo" value={form.barrio} onChange={campo('barrio')} />
            </div>
          </div>
          <div className="adm-form-grid-2">
            <div className="adm-grupo-campo">
              <label htmlFor="uRol">Rol</label>
              <select id="uRol" className="adm-campo" value={form.rol_id} onChange={campo('rol_id')} disabled={editando && esYo(editando)}>
                {ROLES.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
            </div>
            <div className="adm-grupo-campo">
              <label htmlFor="uEstado">Estado</label>
              <select id="uEstado" className="adm-campo" value={form.estado} onChange={campo('estado')} disabled={editando && esYo(editando)}>
                <option value={1}>Activo</option>
                <option value={0}>Inactivo</option>
              </select>
            </div>
          </div>
          <div className="adm-modal-acciones">
            <button type="button" className="adm-btn adm-btn-ghost" onClick={() => setEditando(null)}>Cancelar</button>
            <button type="submit" className="adm-btn adm-btn-primario" disabled={guardando || !form.nombre.trim()}>
              {guardando ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </AdminModal>
    </>
  );
};
