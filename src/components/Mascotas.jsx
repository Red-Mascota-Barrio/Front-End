import { useState, useEffect, useMemo } from 'react';
import { Modal } from 'react-bootstrap';
import { mascotasService, urlFoto, SIN_FOTO } from '../services/mascotasService';

const POR_PAGINA = 6;
const igual = (a, b) => String(a ?? '').toLowerCase() === String(b ?? '').toLowerCase();

function Mascotas() {
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
    <div className="container py-4">
      <h2 className="mb-4 text-center fw-bold text-primary">Adopta una mascota</h2>

      {/* Panel de filtros */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label fw-bold">Buscar por nombre</label>
              <input
                type="text"
                className="form-control"
                placeholder="Escribe para buscar..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <div className="col-md-2">
              <label className="form-label fw-bold">Especie</label>
              <select className="form-select" value={filtroEspecie} onChange={cambiarFiltro(setFiltroEspecie)}>
                <option value="">Todas</option>
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label fw-bold">Tamaño</label>
              <select className="form-select" value={filtroTamano} onChange={cambiarFiltro(setFiltroTamano)}>
                <option value="">Todos</option>
                <option value="pequeno">Pequeño</option>
                <option value="mediano">Mediano</option>
                <option value="grande">Grande</option>
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label fw-bold">Género</label>
              <select className="form-select" value={filtroGenero} onChange={cambiarFiltro(setFiltroGenero)}>
                <option value="">Todos</option>
                <option value="macho">Macho</option>
                <option value="hembra">Hembra</option>
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label fw-bold">Ordenar por</label>
              <select className="form-select" value={orden} onChange={(e) => setOrden(e.target.value)}>
                <option value="nombre_asc">Nombre (A-Z)</option>
                <option value="nombre_desc">Nombre (Z-A)</option>
                <option value="edad_asc">Menor edad</option>
                <option value="edad_desc">Mayor edad</option>
              </select>
            </div>
          </div>

          {/* Chips de filtros activos */}
          <div className="d-flex align-items-center flex-wrap gap-2 mt-3 pt-2 border-top">
            <span className="text-muted small fw-bold">Filtros activos:</span>
            {busquedaDebounced && <span className="badge bg-info text-dark">Nombre: "{busquedaDebounced}"</span>}
            {filtroEspecie && <span className="badge bg-secondary">Especie: {filtroEspecie}</span>}
            {filtroTamano && <span className="badge bg-secondary">Tamaño: {filtroTamano}</span>}
            {filtroGenero && <span className="badge bg-secondary">Género: {filtroGenero}</span>}
            {!hayFiltros && <span className="text-muted small">ninguno</span>}

            {hayFiltros && (
              <button className="btn btn-outline-danger btn-sm ms-auto" onClick={limpiarFiltros}>
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
          <p className="mt-2 text-muted">Cargando mascotas...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger d-flex justify-content-between align-items-center">
          <span>{error}</span>
          <button className="btn btn-sm btn-outline-danger" onClick={cargar}>Reintentar</button>
        </div>
      ) : mascotasFiltradas.length === 0 ? (
        <div className="card text-center py-5 my-4 border-0 bg-light">
          <div className="card-body">
            <h4 className="text-muted fw-bold mb-2">No se encontraron mascotas</h4>
            <p className="text-secondary">Intenta ajustar los filtros o realizar una nueva búsqueda.</p>
            <button className="btn btn-primary mt-2" onClick={limpiarFiltros}>
              Ver todas las mascotas
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="row row-cols-1 row-cols-md-3 g-4">
            {mascotasPaginadas.map((m) => (
              <div className="col" key={m.id_mascota ?? m.id}>
                <div className="card h-100 shadow-sm border-0">
                  <img
                    src={urlFoto(m.foto)}
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = SIN_FOTO; }}
                    className="card-img-top"
                    alt={m.nombre}
                    style={{ height: '220px', objectFit: 'cover' }}
                  />
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h5 className="card-title fw-bold m-0">{m.nombre}</h5>
                      <span className={`badge ${igual(m.genero, 'macho') ? 'bg-primary' : 'bg-danger'}`}>
                        {m.genero}
                      </span>
                    </div>
                    <p className="card-text text-muted small mb-3 flex-grow-1">
                      {m.notas_adicionales || 'Sin descripción adicional.'}
                    </p>
                    <button
                      className="btn btn-outline-primary w-100 mt-auto"
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
            <nav className="d-flex justify-content-center mt-4">
              <ul className="pagination">
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

      {/* Modal de detalle (react-bootstrap: no depende del JS de Bootstrap) */}
      <Modal show={Boolean(mascotaSeleccionada)} onHide={() => setMascotaSeleccionada(null)} centered>
        {mascotaSeleccionada && (
          <>
            <Modal.Header closeButton>
              <Modal.Title className="fw-bold">{mascotaSeleccionada.nombre}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <img
                src={urlFoto(mascotaSeleccionada.foto)}
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = SIN_FOTO; }}
                className="img-fluid rounded mb-3 w-100"
                style={{ height: '250px', objectFit: 'cover' }}
                alt={mascotaSeleccionada.nombre}
              />
              <ul className="list-group list-group-flush">
                <li className="list-group-item"><strong>Especie:</strong> {mascotaSeleccionada.especie || 'N/A'}</li>
                <li className="list-group-item"><strong>Género:</strong> {mascotaSeleccionada.genero}</li>
                <li className="list-group-item"><strong>Edad estimada:</strong> {mascotaSeleccionada.edad_estimada ? `${mascotaSeleccionada.edad_estimada} años` : 'N/A'}</li>
                <li className="list-group-item"><strong>Peso:</strong> {mascotaSeleccionada.peso_kg ? `${mascotaSeleccionada.peso_kg} kg` : 'N/A'}</li>
                <li className="list-group-item"><strong>Tamaño:</strong> {mascotaSeleccionada.tamano}</li>
                <li className="list-group-item"><strong>Esterilizado:</strong> {mascotaSeleccionada.esterilizado ? 'Sí' : 'No'}</li>
                <li className="list-group-item"><strong>Vacunas al día:</strong> {mascotaSeleccionada.vacunas_al_dia ? 'Sí' : 'No'}</li>
                <li className="list-group-item"><strong>Notas:</strong> {mascotaSeleccionada.notas_adicionales || 'Sin notas'}</li>
              </ul>
            </Modal.Body>
            <Modal.Footer>
              <button type="button" className="btn btn-secondary" onClick={() => setMascotaSeleccionada(null)}>
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
