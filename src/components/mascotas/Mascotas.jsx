import { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Row, Col, Form, Button, Pagination, Spinner, Alert } from 'react-bootstrap';
import { mascotasService } from '../../services/mascotasService';
import { especieDeMascota, razaDeMascota, normalizar } from '../../utils/admin';
import { Icono, IconoEspecie } from '../common/Icono';
import MascotaCard from './MascotaCard';
import PerfilMascotaModal from './PerfilMascotaModal';
import '../../styles/mascotas.css';

const POR_PAGINA = 9;

const TAMANOS = [
  { valor: '', texto: 'Todos los tamaños' },
  { valor: 'pequeno', texto: 'Pequeño' },
  { valor: 'mediano', texto: 'Mediano' },
  { valor: 'grande', texto: 'Grande' },
];
const GENEROS = [
  { valor: '', texto: 'Todos' },
  { valor: 'macho', texto: 'Macho', icono: <Icono nombre="gender-male" /> },
  { valor: 'hembra', texto: 'Hembra', icono: <Icono nombre="gender-female" /> },
];
const ORDENES = [
  { valor: 'nombre_asc', texto: 'Nombre A–Z' },
  { valor: 'nombre_desc', texto: 'Nombre Z–A' },
  { valor: 'edad_asc', texto: 'Menor a mayor edad' },
  { valor: 'edad_desc', texto: 'Mayor a menor edad' },
];

// "pequeño" y "pequeno" se consideran iguales
const igual = (a, b) => normalizar(a) === normalizar(b);

const GrupoFiltro = ({ titulo, opciones, valor, onCambiar }) => (
  <div>
    <div className="filtro-titulo">{titulo}</div>
    <div className="filtro-opciones" role="radiogroup" aria-label={titulo}>
      {opciones.map((o) => (
        <button
          key={o.valor || 'todos'}
          type="button"
          role="radio"
          aria-checked={valor === o.valor}
          className={`filtro-opcion ${valor === o.valor ? 'activo' : ''}`}
          onClick={() => onCambiar(o.valor)}
        >
          {o.icono && <span className="filtro-opcion-icono">{o.icono}</span>} {o.texto}
          {o.count !== undefined && <span className="filtro-opcion-count">{o.count}</span>}
        </button>
      ))}
    </div>
  </div>
);

export const Mascotas = () => {
  const [mascotas, setMascotas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [busqueda, setBusqueda] = useState('');
  const [busquedaDebounced, setBusquedaDebounced] = useState('');
  const [filtroEspecie, setFiltroEspecie] = useState('');
  const [filtroTamano, setFiltroTamano] = useState('');
  const [filtroGenero, setFiltroGenero] = useState('');
  const [orden, setOrden] = useState('nombre_asc');

  const [paginaActual, setPaginaActual] = useState(1);
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState(null);
  const [enviandoSolicitud, setEnviandoSolicitud] = useState(false);
  const [solicitudEnviada, setSolicitudEnviada] = useState(false);
  const [mensajeSolicitud, setMensajeSolicitud] = useState('');

  // Buscador con debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setBusquedaDebounced(busqueda);
      setPaginaActual(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [busqueda]);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
// Solo las mascotas con publicación de adopción 'Disponible'
      setMascotas(await mascotasService.listar({ estado_adopcion: 'Disponible' }));
    } catch (err) {
      console.error('Error al obtener mascotas:', err);
      // Sin "response" = no hubo conexión con el servidor; con "response" = el servidor respondió con error
      setError(
        err.response
          ? 'No se pudieron cargar las mascotas. Intenta de nuevo más tarde.'
          : 'El servidor no está disponible en este momento. Intenta de nuevo más tarde.',
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(cargar, 0);
    return () => clearTimeout(id);
  }, [cargar]);

  const seleccionarMascota = (mascota) => {
    setMascotaSeleccionada(mascota);
    setSolicitudEnviada(false);
    setMensajeSolicitud('');
  };

  const handleSolicitarAdopcion = async (adopcionId) => {
    setEnviandoSolicitud(true);
    setMensajeSolicitud('');
    try {
      const respuesta = await mascotasService.solicitarAdopcion(adopcionId);
      setSolicitudEnviada(true);
      setMensajeSolicitud(respuesta.mensaje || 'Tu solicitud de adopción fue enviada.');
    } catch (error) {
      console.error('Error al enviar la solicitud de adopción:', error);
      if (error.response?.status === 409) setSolicitudEnviada(true);
      setMensajeSolicitud(
        error.response?.status === 401
          ? 'Inicia sesión para enviar una solicitud de adopción.'
          : error.response?.data?.mensaje || 'No se pudo enviar tu solicitud. Intenta de nuevo.',
      );
    } finally {
      setEnviandoSolicitud(false);
    }
  };

  // Especies disponibles con su conteo (la especie llega en raza.especie.nombre_especie)
  const especies = useMemo(() => {
    const conteo = new Map();
    mascotas.forEach((m) => {
      const e = especieDeMascota(m);
      if (e) conteo.set(e, (conteo.get(e) ?? 0) + 1);
    });
    return [
      { valor: '', texto: 'Todas', count: mascotas.length },
      ...[...conteo.entries()].map(([e, n]) => ({ valor: e, texto: e, icono: <IconoEspecie especie={e} />, count: n })),
    ];
  }, [mascotas]);

  const limpiarFiltros = () => {
    setBusqueda('');
    setBusquedaDebounced('');
    setFiltroEspecie('');
    setFiltroTamano('');
    setFiltroGenero('');
    setPaginaActual(1);
  };

  const mascotasFiltradas = useMemo(() => {
    const q = normalizar(busquedaDebounced.trim());
    return mascotas
      .filter((m) => {
        const texto = normalizar(`${m.nombre ?? ''} ${razaDeMascota(m)} ${especieDeMascota(m)}`);
        return (
          texto.includes(q) &&
          (!filtroEspecie || igual(especieDeMascota(m), filtroEspecie)) &&
          (!filtroTamano || igual(m.tamano, filtroTamano)) &&
          (!filtroGenero || igual(m.genero, filtroGenero))
        );
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
  const pagina = Math.min(paginaActual, totalPaginas);
  const mascotasPaginadas = mascotasFiltradas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const cambiar = (setter) => (valor) => {
    setter(valor);
    setPaginaActual(1);
  };

  const chips = [
    busquedaDebounced && { texto: `“${busquedaDebounced}”`, quitar: () => setBusqueda('') },
    filtroEspecie && { texto: filtroEspecie, quitar: () => cambiar(setFiltroEspecie)('') },
    filtroTamano && { texto: TAMANOS.find((t) => t.valor === filtroTamano)?.texto, quitar: () => cambiar(setFiltroTamano)('') },
    filtroGenero && { texto: GENEROS.find((g) => g.valor === filtroGenero)?.texto, quitar: () => cambiar(setFiltroGenero)('') },
  ].filter(Boolean);

  return (
    <>
      {/* HÉROE CON BUSCADOR */}
      <section className="pagina-hero">
        <Container>
          <h1>Encuentra tu próxima mascota</h1>
          <p>
            {mascotas.length
              ? `${mascotas.length.toLocaleString('es-CO')} mascotas esperan un hogar en tu barrio`
              : 'Perros y gatos de tu barrio esperan un hogar'}
          </p>
          <form className="barra-busqueda" role="search" onSubmit={(e) => { e.preventDefault(); setBusquedaDebounced(busqueda); }}>
            <i className="bi bi-search barra-busqueda-icono" aria-hidden="true" />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, raza o especie…"
              aria-label="Buscar mascotas"
            />
            <Button type="submit" variant="primary">Buscar</Button>
          </form>
        </Container>
      </section>

      <Container className="pagina-solapada">
        <Row className="g-4">
          {/* FILTROS */}
          <Col lg={3}>
            <aside className="panel-filtros sticky-lateral" aria-label="Filtros de búsqueda">
              <p className="filtros-titulo">Filtrar por</p>
              <GrupoFiltro titulo="Especie" opciones={especies} valor={filtroEspecie} onCambiar={cambiar(setFiltroEspecie)} />
              <div className="filtro-divider" />
              <GrupoFiltro titulo="Tamaño" opciones={TAMANOS} valor={filtroTamano} onCambiar={cambiar(setFiltroTamano)} />
              <div className="filtro-divider" />
              <GrupoFiltro titulo="Género" opciones={GENEROS} valor={filtroGenero} onCambiar={cambiar(setFiltroGenero)} />
            </aside>
          </Col>

          {/* RESULTADOS */}
          <Col lg={9}>
            {/* Barra blanca: es lo que queda encima del borde del héroe, así el texto
                nunca se monta sobre el fondo verde */}
            <div className="barra-herramientas mb-3">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                <p className="resultados-count">
                  Mostrando <strong>{mascotasFiltradas.length}</strong> {mascotasFiltradas.length === 1 ? 'mascota' : 'mascotas'}
                </p>
                <Form.Select
                  size="sm"
                  className="w-auto"
                  value={orden}
                  onChange={(e) => setOrden(e.target.value)}
                  aria-label="Ordenar resultados"
                >
                  {ORDENES.map((o) => <option key={o.valor} value={o.valor}>{o.texto}</option>)}
                </Form.Select>
              </div>

              {chips.length > 0 && (
                <div className="barra-herramientas-chips" aria-live="polite">
                  {chips.map((c) => (
                    <button key={c.texto} type="button" className="chip-filtro" onClick={c.quitar} aria-label={`Quitar filtro ${c.texto}`}>
                      {c.texto} <span className="chip-filtro-x">×</span>
                    </button>
                  ))}
                  <Button variant="link" size="sm" className="text-secondary" onClick={limpiarFiltros}>
                    Limpiar todo
                  </Button>
                </div>
              )}
            </div>

            {cargando ? (
              <div className="text-center py-5">
                <Spinner animation="border" role="status" />
                <p className="mt-3 text-muted">Cargando peluditos…</p>
              </div>
            ) : error ? (
              <Alert variant="danger" className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                <span><Icono nombre="exclamation-circle" /> {error}</span>
                <Button size="sm" variant="outline-danger" onClick={cargar}>Reintentar</Button>
              </Alert>
            ) : mascotasFiltradas.length === 0 ? (
              <div className="estado-vacio">
                <div className="estado-vacio-icono"><Icono nombre="search" /></div>
                <h3>No se encontraron mascotas</h3>
                <p>Intenta ajustar los filtros o realizar una nueva búsqueda.</p>
                <Button variant="primary" onClick={limpiarFiltros}>Ver todas las mascotas</Button>
              </div>
            ) : (
              <>
                <Row xs={1} sm={2} xl={3} className="g-3">
                  {mascotasPaginadas.map((m) => (
                    <Col key={m.id_mascotas ?? m.id_mascota ?? m.id}>
                      <MascotaCard mascota={m} onVerPerfil={seleccionarMascota} />
                    </Col>
                  ))}
                </Row>

                {totalPaginas > 1 && (
                  <Pagination className="justify-content-center mt-5 mb-0">
                    <Pagination.Prev disabled={pagina === 1} onClick={() => setPaginaActual(pagina - 1)} />
                    {Array.from({ length: totalPaginas }, (_, i) => (
                      <Pagination.Item key={i} active={pagina === i + 1} onClick={() => setPaginaActual(i + 1)}>
                        {i + 1}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next disabled={pagina === totalPaginas} onClick={() => setPaginaActual(pagina + 1)} />
                  </Pagination>
                )}
              </>
            )}
          </Col>
        </Row>
      </Container>

      {mascotaSeleccionada && (
        <PerfilMascotaModal
          mascota={mascotaSeleccionada}
          onClose={() => setMascotaSeleccionada(null)}
          modoAdopcion
          onSolicitar={handleSolicitarAdopcion}
          solicitando={enviandoSolicitud}
          solicitudEnviada={solicitudEnviada}
          mensajeSolicitud={mensajeSolicitud}
        />
      )}
    </>
  );
};
