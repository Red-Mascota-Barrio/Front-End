import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

function Mascotas() {
    const [mascotas, setMascotas] = useState([]);
    const [cargando, setCargando] = useState(true);

    //esto es para la busqueda, filtros y orden//

    const [busqueda, setBusqueda] = useState('');
    const [busquedaDebounced, setBusquedaDebounced] =useState('');
    const [filtroEspecie, setFiltroEspecie] = useState('');
    const [filtroTamano, setFiltroTamano] = useState('');
    const [filtroGenero, setFiltroGenero] = useState('');
    const [orden, setOrden] = useState('nombre_asc');

    // esto es paginacion//

    const [paginaActual, setPaginaActual] = useState(1);
    const mascotasPorPagina = 6;

    //  esto es para detalle de mascota//

    const [mascotaSeleccionada, setMascotaSeleccionada] = useState(null);

    //buscador con debounce//

    useEffect(() => {
        const handler =setTimeout(() => {
            setBusquedaDebounced(busqueda);
            setPaginaActual(1);
        }, 400);
        return () => clearTimeout(handler);
    }, [busqueda]);

    useEffect(() => {
        obtenerMascotas();
    }, []);

    const obtenerMascotas = async () => {
        try {
            const res = await api.get('/mascotas');
            setMascotas(res.data);
            setCargando(false);
        } catch (err) {
            console.error('Error al obtener mascotas:', err);
            setCargando(false);
        }
    };

    const limpiarFiltros = () => {
        setBusqueda('');
        setFiltroEspecie('');
        setFiltroTamano('');
        SetFiltroGenero('');
        setOrden('nombre_asc');
        setPaginaActual(1);
    };

    //aqui es para filtrar y ordenar//

    const mascotasFiltradas = mascotas
    .filter((m) => {
        const coincideNombre = m.nombre?.toLowerCase().includes(busquedaDebounced.toLowerCase());
        const coincdeEspecie = filtroEspecie ? m.especie === filtroEspecie : true;
        const coincideTamano = filtroTamano ? m.tamano === filtroTamano : true;
        const coincideGenero = filtroGenero ? m.genero === filtroGenero : true;
        return coincideNombre && coincdeEspecie && coincideTamano && coincideGenero;
    })
    .sort((a, b) => {
        if (orden === 'nombre_asc') return a.nombre.localeCompare(b.nombre);
        if (orden === 'nombre_desc') return b.nombre.localeCompare(a.nombre);
        if (orden === 'edad_asc') return (a.edad_estimada || 0) - (b.edad_estimada || 0);
        if (orden === 'edad_desc') return (b.edad_estimada || 0) - (a.edad_estimada || 0);
        return 0;
    });

    const indiceUltimo = paginaActual * mascotasPorPagina;
    const indicePrimer = indiceUltimo - mascotasPorPagina;
    const mascotasPaginadas = mascotasFiltradas.slice(indicePrimer, indiceUltimo);
    const totalPaginas = Math.ceil(mascotasFiltradas.length / mascotasPorPagina);

    return (
    <div className="container py-4">
      <h2 className="mb-4 text-center fw-bold text-primary">Red de Mascotas - Búsqueda</h2>

      {/* PANEL DE FILTROS Y BUSCADOR (RF06, RF19) */}
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
              <select className="form-select" value={filtroEspecie} onChange={(e) => { setFiltroEspecie(e.target.value); setPaginaActual(1); }}>
                <option value="">Todas</option>
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label fw-bold">Tamaño</label>
              <select className="form-select" value={filtroTamano} onChange={(e) => { setFiltroTamano(e.target.value); setPaginaActual(1); }}>
                <option value="">Todos</option>
                <option value="pequeno">Pequeño</option>
                <option value="mediano">Mediano</option>
                <option value="grande">Grande</option>
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label fw-bold">Género</label>
              <select className="form-select" value={filtroGenero} onChange={(e) => { setFiltroGenero(e.target.value); setPaginaActual(1); }}>
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
                <option value="edad_asc">Menor Edad</option>
                <option value="edad_desc">Mayor Edad</option>
              </select>
            </div>
          </div>

          {/* CHIPS DE FILTROS ACTIVOS Y BOTÓN LIMPIAR */}
          <div className="d-flex align-items-center flex-wrap gap-2 mt-3 pt-2 border-top">
            <span className="text-muted small fw-bold">Filtros activos:</span>
            {busquedaDebounced && <span className="badge bg-info text-dark">Nombre: "{busquedaDebounced}"</span>}
            {filtroEspecie && <span className="badge bg-secondary">Especie: {filtroEspecie}</span>}
            {filtroTamano && <span className="badge bg-secondary">Tamaño: {filtroTamano}</span>}
            {filtroGenero && <span className="badge bg-secondary">Género: {filtroGenero}</span>}
            
            {(busquedaDebounced || filtroEspecie || filtroTamano || filtroGenero) && (
              <button className="btn btn-outline-danger btn-sm ms-auto" onClick={limpiarFiltros}>
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* GRID DE TARJETAS DE MASCOTAS */}
      {cargando ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted">Cargando mascotas...</p>
        </div>
      ) : mascotasFiltradas.length === 0 ? (
        /* ESTADO VACÍO */
        <div className="card text-center py-5 my-4 border-0 bg-light">
          <div className="card-body">
            <h4 className="text-muted fw-bold mb-2">No se encontraron mascotas</h4>
            <p className="text-secondary">Intenta ajustando los filtros o realizando una nueva búsqueda.</p>
            <button className="btn btn-primary mt-2" onClick={limpiarFiltros}>
              Ver todas las mascotas
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="row row-cols-1 row-cols-md-3 g-4">
            {mascotasPaginadas.map((m) => (
              <div className="col" key={m.id_mascota || m.id}>
                <div className="card h-100 shadow-sm border-0">
                  <img
                    src={m.foto ? `http://localhost:8000/storage/${m.foto}` : 'https://via.placeholder.com/300x200?text=Sin+Foto'}
                    className="card-img-top"
                    alt={m.nombre}
                    style={{ height: '220px', objectFit: 'cover' }}
                  />
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h5 className="card-title fw-bold m-0">{m.nombre}</h5>
                      <span className={`badge ${m.genero === 'macho' ? 'bg-primary' : 'bg-danger'}`}>
                        {m.genero}
                      </span>
                    </div>
                    <p className="card-text text-muted small mb-3 flex-grow-1">
                      {m.notas_adicionales || 'Sin descripción adicional.'}
                    </p>
                    <button
                      className="btn btn-outline-primary w-100 mt-auto"
                      data-bs-toggle="modal"
                      data-bs-target="#detalleModal"
                      onClick={() => setMascotaSeleccionada(m)}
                    >
                      Ver Detalle
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINACIÓN */}
          {totalPaginas > 1 && (
            <nav className="d-flex justify-content-center mt-4">
              <ul className="pagination">
                <li className={`page-item ${paginaActual === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPaginaActual(paginaActual - 1)}>Anterior</button>
                </li>
                {[...Array(totalPaginas)].map((_, i) => (
                  <li key={i} className={`page-item ${paginaActual === i + 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setPaginaActual(i + 1)}>{i + 1}</button>
                  </li>
                ))}
                <li className={`page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPaginaActual(paginaActual + 1)}>Siguiente</button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}

      {/* MODAL DETALLE DE MASCOTA (RF03, RF16) */}
      <div className="modal fade" id="detalleModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            {mascotaSeleccionada && (
              <>
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">{mascotaSeleccionada.nombre}</h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  <img
                    src={mascotaSeleccionada.foto ? `http://localhost:8000/storage/${mascotaSeleccionada.foto}` : 'https://via.placeholder.com/300x200?text=Sin+Foto'}
                    className="img-fluid rounded mb-3 w-100"
                    style={{ height: '250px', objectFit: 'cover' }}
                    alt={mascotaSeleccionada.nombre}
                  />
                  <ul className="list-group list-group-flush mb-3">
                    <li className="list-group-item"><strong>Género:</strong> {mascotaSeleccionada.genero}</li>
                    <li className="list-group-item"><strong>Edad estimada:</strong> {mascotaSeleccionada.edad_estimada || 'N/A'} años</li>
                    <li className="list-group-item"><strong>Peso:</strong> {mascotaSeleccionada.peso_kg ? `${mascotaSeleccionada.peso_kg} kg` : 'N/A'}</li>
                    <li className="list-group-item"><strong>Tamaño:</strong> {mascotaSeleccionada.tamano}</li>
                    <li className="list-group-item"><strong>Esterilizado:</strong> {mascotaSeleccionada.esterilizado ? 'Sí' : 'No'}</li>
                    <li className="list-group-item"><strong>Vacunas al día:</strong> {mascotaSeleccionada.vacunas_al_dia ? 'Sí' : 'No'}</li>
                    <li className="list-group-item"><strong>Notas:</strong> {mascotaSeleccionada.notas_adicionales || 'Sin notas'}</li>
                  </ul>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Mascotas; 
