import { useState, useEffect, useMemo } from 'react';
import { Modal } from 'react-bootstrap';
import { mascotasService, urlFoto, SIN_FOTO } from '../../services/mascotasService';

const POR_PAGINA = 6;
const igual = (a, b) => String(a ?? '').toLowerCase() === String(b ?? '').toLowerCase();

export const Mascotas = () => {
  const [mascotas, setMascotas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Búsqueda, filtros y orden
  const [busqueda, setBusqueda] = useState('');
  const [busquedaDebounced, setBusquedaDebounced] = useState('');
  const [filtroEspecie, setFiltroEspecie] = useState('');
  const [filtroTamano, setFiltroTamano] = useState('');
  const [filtroGenero, setFiltroGenero] = useState('');
  const [orden, setOrden] = useState('nombre_asc');

  // Paginación y detalle
  const [paginaActual, setPaginaActual] = useState(1);
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState(null);

  // Buscador con debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setBusquedaDebounced(busqueda);
      setPaginaActual(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [busqueda]);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      setMascotas(await mascotasService.listar());
    } catch (err) {
      console.error('Error al obtener mascotas:', err);
      setError('No se pudieron cargar las mascotas. Verifica que el servidor esté activo.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    let activo = true;
    mascotasService
      .listar()
      .then((data) => activo && setMascotas(data))
      .catch((err) => {
        console.error('Error al obtener mascotas:', err);
        if (activo) setError('No se pudieron cargar las mascotas. Verifica que el servidor esté activo.');
      })
      .finally(() => activo && setCargando(false));
    return () => { activo = false; };
  }, []);

  const limpiarFiltros = () => {
    setBusqueda('');
    setBusquedaDebounced('');
    setFiltroEspecie('');
    setFiltroTamano('');
    setFiltroGenero('');
    setOrden('nombre_asc');
    setPaginaActual(1);
  };

  // Filtrar y ordenar
  const mascotasFiltradas = useMemo(() => {
    const q = busquedaDebounced.trim().toLowerCase();
    return mascotas
      .filter((m) => {
        const coincideNombre = (m.nombre ?? '').toLowerCase().includes(q);
        const coincideEspecie = filtroEspecie ? igual(m.especie, filtroEspecie) : true;
        const coincideTamano = filtroTamano ? igual(m.tamano, filtroTamano) : true;
        const coincideGenero = filtroGenero ? igual(m.genero, filtroGenero) : true;
        return coincideNombre && coincideEspecie && coincideTamano && coincideGenero;
      })
      .sort((a, b) => {
        const nA = a.nombre ?? '';
        const nB = b.nombre ?? '';
        if (orden === 'nombre_asc') return nA.localeCompare(nB);
        if (orden === 'nombre_desc') return nB.localeCompare(nA);
        if (orden === 'edad_asc') return (a.edad_estimada || 0) - (b.edad_estimada || 0);
        if (orden === 'edad_desc') return (b.edad_estimada || 0) - (a.edad_estimada || 0);
        return 0;
      });
  }, [mascotas, busquedaDebounced, filtroEspecie, filtroTamano, filtroGenero, orden]);

  const totalPaginas = Math.max(1, Math.ceil(mascotasFiltradas.length / POR_PAGINA));
  const paginaSegura = Math.min(paginaActual, totalPaginas);
  const mascotasPaginadas = mascotasFiltradas.slice((paginaSegura - 1) * POR_PAGINA, paginaSegura * POR_PAGINA);
  const hayFiltros = busquedaDebounced || filtroEspecie || filtroTamano || filtroGenero;

  const cambiarFiltro = (setter) => (e) => {
    setter(e.target.value);
    setPaginaActual(1);
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4 text-center fw-bold text-primary">Adopta una mascota</h2>

      {/* Panel de filtros */}
      <div className="card shadow-sm border-0 bg-light mb-5 rounded-4">
        <div className="card-body p-4">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label fw-semibold text-secondary">Buscar por nombre</label>
              <input
                type="text"
                className="form-control"
                placeholder="Escribe para buscar..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <div className="col-md-2">
              <label className="form-label fw-semibold text-secondary">Especie</label>
              <select className="form-select" value={filtroEspecie} onChange={cambiarFiltro(setFiltroEspecie)}>
                <option value="">Todas</option>
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label fw-semibold text-secondary">Tamaño</label>
              <select className="form-select" value={filtroTamano} onChange={cambiarFiltro(setFiltroTamano)}>
                <option value="">Todos</option>
                <option value="pequeno">Pequeño</option>
                <option value="mediano">Mediano</option>
                <option value="grande">Grande</option>
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label fw-semibold text-secondary">Género</label>
              <select className="form-select" value={filtroGenero} onChange={cambiarFiltro(setFiltroGenero)}>
                <option value="">Todos</option>
                <option value="macho">Macho</option>
                <option value="hembra">Hembra</option>
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label fw-semibold text-secondary">Ordenar por</label>
              <select className="form-select" value={orden} onChange={(e) => setOrden(e.target.value)}>
                <option value="nombre_asc">Nombre (A-Z)</option>
                <option value="nombre_desc">Nombre (Z-A)</option>
                <option value="edad_asc">Menor edad</option>
                <option value="edad_desc">Mayor edad</option>
              </select>
            </div>
          </div>

          {/* Chips de filtros activos */}
          <div className="d-flex align-items-center flex-wrap gap-2 mt-4 pt-3 border-top">
            <span className="text-muted small fw-bold">Filtros activos:</span>
            {busquedaDebounced && <span className="badge bg-primary bg-opacity-10 text-primary border border-primary">Nombre: "{busquedaDebounced}"</span>}
            {filtroEspecie && <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary">Especie: {filtroEspecie}</span>}
            {filtroTamano && <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary">Tamaño: {filtroTamano}</span>}
            {filtroGenero && <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary">Género: {filtroGenero}</span>}
            {!hayFiltros && <span className="text-muted small">Ninguno</span>}

            {hayFiltros && (
              <button className="btn btn-outline-danger btn-sm ms-auto rounded-pill px-3" onClick={limpiarFiltros}>
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenido */}
      {cargando ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3 text-muted fw-medium">Cargando peluditos...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger d-flex justify-content-between align-items-center shadow-sm rounded-4">
          <span>{error}</span>
          <button className="btn btn-sm btn-outline-danger rounded-pill" onClick={cargar}>Reintentar</button>
        </div>
      ) : mascotasFiltradas.length === 0 ? (
        <div className="card text-center py-5 my-4 border-0 bg-light rounded-4">
          <div className="card-body">
            <h4 className="text-muted fw-bold mb-2">No se encontraron mascotas</h4>
            <p className="text-secondary">Intenta ajustar los filtros o realizar una nueva búsqueda.</p>
            <button className="btn btn-primary mt-3 rounded-pill px-4" onClick={limpiarFiltros}>
              Ver todas las mascotas
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {mascotasPaginadas.map((m) => (
              <div className="col" key={m.id_mascota ?? m.id}>
                <div 
                  className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden"
                  style={{ transition: 'transform 0.2s', cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <img
                    src={urlFoto(m.foto)}
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = SIN_FOTO; }}
                    className="card-img-top"
                    alt={m.nombre}
                    style={{ height: '240px', objectFit: 'cover' }}
                  />
                  <div className="card-body d-flex flex-column p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h4 className="card-title fw-bold text-dark m-0">{m.nombre}</h4>
                      <span className={`badge rounded-pill px-3 py-2 ${igual(m.genero, 'macho') ? 'bg-primary bg-opacity-10 text-primary' : 'bg-danger bg-opacity-10 text-danger'}`}>
                        {m.genero}
                      </span>
                    </div>
                    <p className="card-text text-muted mb-4 flex-grow-1">
                      {m.notas_adicionales || 'Sin descripción adicional disponible para este peludito.'}
                    </p>
                    <button
                      className="btn btn-primary rounded-pill w-100 mt-auto fw-medium shadow-sm"
                      onClick={() => setMascotaSeleccionada(m)}
                    >
                      Ver detalle
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <nav className="d-flex justify-content-center mt-5">
              <ul className="pagination shadow-sm">
                <li className={`page-item ${paginaSegura === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPaginaActual(paginaSegura - 1)}>Anterior</button>
                </li>
                {[...Array(totalPaginas)].map((_, i) => (
                  <li key={i} className={`page-item ${paginaSegura === i + 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setPaginaActual(i + 1)}>{i + 1}</button>
                  </li>
                ))}
                <li className={`page-item ${paginaSegura === totalPaginas ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPaginaActual(paginaSegura + 1)}>Siguiente</button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}

      {/* Modal de detalle */}
      <Modal show={Boolean(mascotaSeleccionada)} onHide={() => setMascotaSeleccionada(null)} centered size="lg">
        {mascotaSeleccionada && (
          <>
            <Modal.Header closeButton className="border-0 pb-0">
              <Modal.Title className="fw-bold fs-3">{mascotaSeleccionada.nombre}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-3">
              <div className="row g-4">
                <div className="col-md-5">
                  <img
                    src={urlFoto(mascotaSeleccionada.foto)}
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = SIN_FOTO; }}
                    className="img-fluid rounded-4 shadow-sm w-100"
                    style={{ height: '100%', minHeight: '300px', objectFit: 'cover' }}
                    alt={mascotaSeleccionada.nombre}
                  />
                </div>
                <div className="col-md-7">
                  <div className="bg-light p-4 rounded-4 h-100">
                    <h5 className="fw-bold text-primary mb-3">Información General</h5>
                    <ul className="list-unstyled mb-0 text-dark">
                      <li className="mb-2"><strong>Especie:</strong> <span className="text-muted">{mascotaSeleccionada.especie || 'N/A'}</span></li>
                      <li className="mb-2"><strong>Género:</strong> <span className="text-muted">{mascotaSeleccionada.genero}</span></li>
                      <li className="mb-2"><strong>Edad estimada:</strong> <span className="text-muted">{mascotaSeleccionada.edad_estimada ? `${mascotaSeleccionada.edad_estimada} años` : 'N/A'}</span></li>
                      <li className="mb-2"><strong>Peso:</strong> <span className="text-muted">{mascotaSeleccionada.peso_kg ? `${mascotaSeleccionada.peso_kg} kg` : 'N/A'}</span></li>
                      <li className="mb-2"><strong>Tamaño:</strong> <span className="text-muted">{mascotaSeleccionada.tamano}</span></li>
                      <li className="mb-2"><strong>Esterilizado:</strong> <span className="text-muted">{mascotaSeleccionada.esterilizado ? 'Sí' : 'No'}</span></li>
                      <li className="mb-2"><strong>Vacunas al día:</strong> <span className="text-muted">{mascotaSeleccionada.vacunas_al_dia ? 'Sí' : 'No'}</span></li>
                    </ul>
                    <hr className="my-3 text-secondary" />
                    <h5 className="fw-bold text-primary mb-2">Notas</h5>
                    <p className="text-muted small mb-0">{mascotaSeleccionada.notas_adicionales || 'Sin notas adicionales.'}</p>
                  </div>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer className="border-0 pt-0">
              <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setMascotaSeleccionada(null)}>
                Cerrar
              </button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </div>
  );
}

export default Mascotas;