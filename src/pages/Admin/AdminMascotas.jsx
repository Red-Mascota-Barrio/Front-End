import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService, mensajeError } from '../../services/adminService';
import { urlFoto } from '../../services/mascotasService';
import {
  PageHeader, StatCard, Badge, Toolbar, SelectFiltro, TablaFooter,
  EstadoVacio, Cargando, Aviso, AdminModal,
} from '../../components/admin/AdminUI';
import {
  normalizar, estadoMascota, especieDeMascota, razaDeMascota, emojiEspecie, claseIconoEspecie,
  confirmar, notificarExito, notificarError, usePaginacion,
} from '../../utils/admin';

const capitalizar = (t) => (t ? String(t).charAt(0).toUpperCase() + String(t).slice(1) : '');
const siNo = (v) => (v === null || v === undefined || v === '' ? '—' : Number(v) ? 'Sí' : 'No');

export const AdminMascotas = () => {
  const [mascotas, setMascotas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroEspecie, setFiltroEspecie] = useState('');
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
        const lista = await adminService.listarMascotas();
        setMascotas([...lista].sort((a, b) => (b.id_mascotas ?? 0) - (a.id_mascotas ?? 0)));
      } catch (e) {
        setMascotas([]);
        setError(mensajeError(e, 'No pudimos cargar las mascotas.'));
      } finally {
        setCargando(false);
      }
    })();
  }, [recarga]);

  // Especies presentes en los datos para el filtro
  const especies = useMemo(
    () => [...new Set(mascotas.map(especieDeMascota).filter(Boolean))].sort(),
    [mascotas],
  );

  const filtrados = useMemo(() => {
    const q = normalizar(busqueda);
    return mascotas.filter((m) => {
      if (filtroEspecie && especieDeMascota(m) !== filtroEspecie) return false;
      if (filtroEstado && estadoMascota(m).clave !== filtroEstado) return false;
      if (!q) return true;
      return normalizar(`${m.nombre} ${razaDeMascota(m)} ${especieDeMascota(m)} ${m.tamano}`).includes(q);
    });
  }, [mascotas, busqueda, filtroEspecie, filtroEstado]);

  const { pagina, setPagina, totalPaginas, visibles } = usePaginacion(filtrados, 10);

  const stats = useMemo(() => {
    const cuenta = (clave) => mascotas.filter((m) => estadoMascota(m).clave === clave).length;
    return {
      total: mascotas.length,
      disponibles: cuenta('disponible'),
      noDisponibles: cuenta('no-disponible') + cuenta('sin-publicar'),
      adoptadas: cuenta('adoptado'),
    };
  }, [mascotas]);

  const eliminar = async (m) => {
    const ok = await confirmar({
      titulo: `¿Eliminar a ${m.nombre}?`,
      texto: 'Se eliminará la publicación de la mascota. Esta acción no se puede deshacer.',
      boton: 'Eliminar',
      peligro: true,
    });
    if (!ok) return;
    try {
      await adminService.eliminarMascota(m.id_mascotas);
      setMascotas((lista) => lista.filter((x) => x.id_mascotas !== m.id_mascotas));
      setDetalle(null);
      notificarExito('Mascota eliminada');
    } catch (err) {
      notificarError('No se pudo eliminar', mensajeError(err));
    }
  };

  return (
    <>
      <PageHeader
        titulo="Gestión de mascotas"
        subtitulo={cargando ? 'Cargando mascotas…' : `${stats.total.toLocaleString('es-CO')} mascotas registradas en la plataforma`}
      >
        <button type="button" className="adm-btn adm-btn-ghost adm-btn-sm" onClick={cargar} disabled={cargando}>
          ↻ Actualizar
        </button>
        <Link to="/mascotas" className="adm-btn adm-btn-ghost adm-btn-sm">Ver listado público</Link>
      </PageHeader>

      <div className="adm-grid-4 adm-mb-md">
        <StatCard icono="corazon" numero={stats.total} label="Total mascotas" cargando={cargando} />
        <StatCard icono="reloj" numero={stats.disponibles} label="En adopción" cargando={cargando} />
        <StatCard icono="lupa" numero={stats.noDisponibles} label="No disponibles" cargando={cargando} />
        <StatCard icono="check" numero={stats.adoptadas} label="Adoptadas" cargando={cargando} />
      </div>

      {error && <Aviso tipo="error">{error}</Aviso>}

      <Toolbar busqueda={busqueda} onBusqueda={setBusqueda} placeholder="Buscar por nombre, raza o tamaño…">
        <SelectFiltro
          label="Filtrar por especie"
          value={filtroEspecie}
          onChange={setFiltroEspecie}
          opciones={[{ value: '', label: 'Todas las especies' }, ...especies.map((e) => ({ value: e, label: e }))]}
        />
        <SelectFiltro
          label="Filtrar por estado"
          value={filtroEstado}
          onChange={setFiltroEstado}
          opciones={[
            { value: '', label: 'Todos los estados' },
            { value: 'disponible', label: 'En adopción' },
            { value: 'no-disponible', label: 'No disponible' },
            { value: 'adoptado', label: 'Adoptado' },
            { value: 'sin-publicar', label: 'Sin publicar' },
          ]}
        />
      </Toolbar>

      <div className="adm-tabla-wrap">
        {cargando ? (
          <Cargando texto="Cargando mascotas…" />
        ) : filtrados.length === 0 ? (
          <EstadoVacio
            icono={mascotas.length ? '🔍' : '🐾'}
            titulo={mascotas.length ? 'Sin resultados' : 'No hay mascotas registradas'}
            sub={mascotas.length ? 'Prueba con otra búsqueda o filtro.' : undefined}
          />
        ) : (
          <>
            <div className="adm-tabla-scroll">
              <table className="adm-tabla">
                <thead>
                  <tr>
                    <th>Mascota</th>
                    <th>Especie / Raza</th>
                    <th>Tamaño</th>
                    <th>Estado</th>
                    <th>Vacunas</th>
                    <th>Esterilizado</th>
                    <th className="th-derecha">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {visibles.map((m) => {
                    const especie = especieDeMascota(m);
                    const est = estadoMascota(m);
                    return (
                      <tr key={m.id_mascotas}>
                        <td>
                          <div className="adm-tabla-usuario">
                            <div className={`adm-tabla-mascota ${claseIconoEspecie(especie)}`}>
                              {m.foto ? <img src={urlFoto(m.foto)} alt="" /> : emojiEspecie(especie)}
                            </div>
                            <div>
                              <div className="adm-tabla-nombre">{m.nombre}</div>
                              <div className="adm-tabla-sub">
                                {[capitalizar(m.genero), m.edad_estimada].filter(Boolean).join(' · ') || '—'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="adm-td-sec">{[especie, razaDeMascota(m)].filter(Boolean).join(' · ') || '—'}</td>
                        <td className="adm-td-sec">{m.tamano || '—'}</td>
                        <td><Badge clase={est.clase}>{est.texto}</Badge></td>
                        <td className="adm-td-tenue">{siNo(m.vacunas_al_dia)}</td>
                        <td className="adm-td-tenue">{siNo(m.esterilizado)}</td>
                        <td>
                          <div className="adm-acciones-tabla">
                            <button type="button" className="adm-accion-btn" title="Ver detalle" onClick={() => setDetalle(m)}>👁</button>
                            <button type="button" className="adm-accion-btn peligro" title="Eliminar" onClick={() => eliminar(m)}>🗑</button>
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
              nombre="mascotas"
              pagina={pagina}
              totalPaginas={totalPaginas}
              onPagina={setPagina}
            />
          </>
        )}
      </div>

      <AdminModal
        abierto={Boolean(detalle)}
        titulo={detalle ? `${emojiEspecie(especieDeMascota(detalle))} ${detalle.nombre}` : ''}
        onCerrar={() => setDetalle(null)}
      >
        {detalle && (
          <>
            {detalle.foto && (
              <img
                src={urlFoto(detalle.foto)}
                alt={detalle.nombre}
                style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 16, marginBottom: 20 }}
              />
            )}
            <dl className="adm-detalle-lista" style={{ marginBottom: 20 }}>
              <dt>Estado</dt><dd><Badge clase={estadoMascota(detalle).clase}>{estadoMascota(detalle).texto}</Badge></dd>
              <dt>Especie</dt><dd>{especieDeMascota(detalle) || '—'}</dd>
              <dt>Raza</dt><dd>{razaDeMascota(detalle) || '—'}</dd>
              <dt>Género</dt><dd>{capitalizar(detalle.genero) || '—'}</dd>
              <dt>Edad</dt><dd>{detalle.edad_estimada || '—'}</dd>
              <dt>Peso</dt><dd>{detalle.peso_kg ? `${detalle.peso_kg} kg` : '—'}</dd>
              <dt>Tamaño</dt><dd>{detalle.tamano || '—'}</dd>
              <dt>Vacunas al día</dt><dd>{siNo(detalle.vacunas_al_dia)}</dd>
              <dt>Esterilizado</dt><dd>{siNo(detalle.esterilizado)}</dd>
              <dt>Notas</dt><dd>{detalle.notas_adicionales || '—'}</dd>
            </dl>
            <div className="adm-modal-acciones">
              <button type="button" className="adm-btn adm-btn-peligro" onClick={() => eliminar(detalle)}>🗑 Eliminar</button>
              <button type="button" className="adm-btn adm-btn-ghost" onClick={() => setDetalle(null)}>Cerrar</button>
            </div>
          </>
        )}
      </AdminModal>
    </>
  );
};
