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
  normalizar, estadoMascota, especieDeMascota, razaDeMascota, emojiEspecie, claseIconoEspecie,
  confirmar, notificarExito, notificarError, usePaginacion,
} from '../../utils/admin';

const capitalizar = (t) => (t ? String(t).charAt(0).toUpperCase() + String(t).slice(1) : '');
const siNo = (v) => (v === null || v === undefined || v === '' ? '—' : Number(v) ? 'Sí' : 'No');
const alFallar = (e) => { e.currentTarget.onerror = null; e.currentTarget.src = SIN_FOTO; };

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

  const fotoDetalle = detalle ? fotoDeMascota(detalle) : null;

  return (
    <>
      <PageHeader
        titulo="Gestión de mascotas"
        subtitulo={cargando ? 'Cargando mascotas…' : `${stats.total.toLocaleString('es-CO')} mascotas registradas en la plataforma`}
      >
        <Button variant="outline-secondary" size="sm" onClick={cargar} disabled={cargando}>
          <i className="bi bi-arrow-clockwise me-1" /> Actualizar
        </Button>
        <Button as={Link} to="/mascotas" variant="outline-secondary" size="sm">
          <i className="bi bi-box-arrow-up-right me-1" /> Ver listado público
        </Button>
      </PageHeader>

      <Row xs={1} sm={2} xl={4} className="g-3 mb-4">
        <Col><StatCard icono="corazon" numero={stats.total} label="Total mascotas" cargando={cargando} /></Col>
        <Col><StatCard icono="reloj" numero={stats.disponibles} label="En adopción" cargando={cargando} /></Col>
        <Col><StatCard icono="lupa" numero={stats.noDisponibles} label="No disponibles" cargando={cargando} /></Col>
        <Col><StatCard icono="check" numero={stats.adoptadas} label="Adoptadas" cargando={cargando} /></Col>
      </Row>

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

      <TablaCard>
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
            <Table hover responsive className="align-middle mb-0 small">
              <thead className="table-light">
                <tr>
                  <th>Mascota</th>
                  <th>Especie / Raza</th>
                  <th>Tamaño</th>
                  <th>Estado</th>
                  <th>Vacunas</th>
                  <th>Esterilizado</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((m) => {
                  const especie = especieDeMascota(m);
                  const est = estadoMascota(m);
                  const color = claseIconoEspecie(especie);
                  const foto = fotoDeMascota(m);
                  return (
                    <tr key={m.id_mascotas}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className={`adm-avatar rounded-3 border fs-5 bg-${color}-subtle border-${color}-subtle`}>
                            {foto ? <img src={urlFoto(foto)} alt="" onError={alFallar} /> : emojiEspecie(especie)}
                          </div>
                          <div>
                            <div className="fw-semibold">{m.nombre}</div>
                            <div className="text-secondary" style={{ fontSize: '.75rem' }}>
                              {[capitalizar(m.genero), m.edad_estimada].filter(Boolean).join(' · ') || '—'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-secondary">{[especie, razaDeMascota(m)].filter(Boolean).join(' · ') || '—'}</td>
                      <td className="text-secondary">{m.tamano || '—'}</td>
                      <td><Badge variante={est.clase}>{est.texto}</Badge></td>
                      <td className="text-body-tertiary">{siNo(m.vacunas_al_dia)}</td>
                      <td className="text-body-tertiary">{siNo(m.esterilizado)}</td>
                      <td>
                        <div className="d-flex justify-content-end gap-1">
                          <BotonAccion icono="ojo" titulo="Ver detalle" onClick={() => setDetalle(m)} />
                          <BotonAccion icono="eliminar" titulo="Eliminar" peligro onClick={() => eliminar(m)} />
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
              nombre="mascotas"
              pagina={pagina}
              totalPaginas={totalPaginas}
              onPagina={setPagina}
            />
          </>
        )}
      </TablaCard>

      <AdminModal
        abierto={Boolean(detalle)}
        titulo={detalle ? `${emojiEspecie(especieDeMascota(detalle))} ${detalle.nombre}` : ''}
        onCerrar={() => setDetalle(null)}
      >
        {detalle && (
          <>
            {fotoDetalle && (
              <img
                src={urlFoto(fotoDetalle)}
                alt={detalle.nombre}
                onError={alFallar}
                className="w-100 rounded-4 mb-3 object-fit-cover"
                style={{ height: 220 }}
              />
            )}
            <dl className="row small mb-0">
              <dt className="col-5 col-sm-4 text-secondary fw-medium">Estado</dt>
              <dd className="col-7 col-sm-8"><Badge variante={estadoMascota(detalle).clase}>{estadoMascota(detalle).texto}</Badge></dd>
              <dt className="col-5 col-sm-4 text-secondary fw-medium">Especie</dt><dd className="col-7 col-sm-8">{especieDeMascota(detalle) || '—'}</dd>
              <dt className="col-5 col-sm-4 text-secondary fw-medium">Raza</dt><dd className="col-7 col-sm-8">{razaDeMascota(detalle) || '—'}</dd>
              <dt className="col-5 col-sm-4 text-secondary fw-medium">Género</dt><dd className="col-7 col-sm-8">{capitalizar(detalle.genero) || '—'}</dd>
              <dt className="col-5 col-sm-4 text-secondary fw-medium">Edad</dt><dd className="col-7 col-sm-8">{detalle.edad_estimada || '—'}</dd>
              <dt className="col-5 col-sm-4 text-secondary fw-medium">Peso</dt><dd className="col-7 col-sm-8">{detalle.peso_kg ? `${detalle.peso_kg} kg` : '—'}</dd>
              <dt className="col-5 col-sm-4 text-secondary fw-medium">Tamaño</dt><dd className="col-7 col-sm-8">{detalle.tamano || '—'}</dd>
              <dt className="col-5 col-sm-4 text-secondary fw-medium">Vacunas al día</dt><dd className="col-7 col-sm-8">{siNo(detalle.vacunas_al_dia)}</dd>
              <dt className="col-5 col-sm-4 text-secondary fw-medium">Esterilizado</dt><dd className="col-7 col-sm-8">{siNo(detalle.esterilizado)}</dd>
              <dt className="col-5 col-sm-4 text-secondary fw-medium">Notas</dt><dd className="col-7 col-sm-8">{detalle.notas_adicionales || '—'}</dd>
            </dl>
            <ModalAcciones>
              <Button variant="outline-secondary" onClick={() => setDetalle(null)}>Cerrar</Button>
              <Button variant="danger" onClick={() => eliminar(detalle)}>
                <i className="bi bi-trash me-1" /> Eliminar
              </Button>
            </ModalAcciones>
          </>
        )}
      </AdminModal>
    </>
  );
};
