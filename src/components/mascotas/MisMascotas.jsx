import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { mascotasService } from '../../services/mascotasService';
import MascotaCard from './MascotaCard';
import { Icono } from '../common/Icono';
import RegistrarMascotaModal from './RegistrarMascotaModal';
import PerfilMascotaModal from './PerfilMascotaModal';
import '../../styles/mascotas.css';

export default function MisMascotas() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [listaFiable, setListaFiable] = useState(true);
  const [mascotas, setMascotas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarModalRegistro, setMostrarModalRegistro] = useState(
    () => searchParams.get('registrar') === '1'
  );
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState(null);

  // OJO: el back no tiene una ruta para listar solo las mascotas del usuario
  // (la relación está en usuario_mascotas). Mientras tanto se usa GET /mascotas,
  // que trae todas. Cuando exista GET /mis-mascotas, basta con cambiar esta llamada.
  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const { mascotas: propias, fiable } = await mascotasService.misMascotas(user);
      setMascotas(propias);
      setListaFiable(fiable);
    } catch (err) {
      console.error('Error al obtener mascotas:', err);
      setError('No se pudieron cargar las mascotas desde el servidor.');
    } finally {
      setCargando(false);
    }
  }, [user]);

  useEffect(() => {
    const id = window.setTimeout(() => void cargar(), 0);
    return () => window.clearTimeout(id);
  }, [cargar]);

  const abrirRegistro = () => setMostrarModalRegistro(true);
  const cerrarRegistro = () => {
    setMostrarModalRegistro(false);
    // Quita ?registrar=1 para que el modal no se reabra al recargar
    if (searchParams.has('registrar')) setSearchParams({}, { replace: true });
  };

  const handleGuardarMascota = async (datosNuevos) => {
    await mascotasService.crear(datosNuevos); // si falla, el modal muestra el error
    cerrarRegistro();
    await cargar();
  };

  return (
    <Container className="py-5">
      <div className="encabezado-pagina d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
        <div>
          <h1>Mis mascotas</h1>
          <p>Registra a tus mascotas: quedan vinculadas a tu perfil automáticamente.</p>
        </div>
        <Button variant="primary" onClick={abrirRegistro}>
          <i className="bi bi-plus-lg" aria-hidden="true" /> Registrar mascota
        </Button>
      </div>

      {!listaFiable && (
        <Alert variant="warning" className="d-flex gap-2">
          <Icono nombre="info-circle" />
          <span>La API no indica de quién es cada mascota, así que no se puede mostrar solo tu lista.</span>
        </Alert>
      )}

      {cargando ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" />
          <p className="mt-2 text-muted">Cargando tus mascotas…</p>
        </div>
      ) : error ? (
        <Alert variant="danger" className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <span><Icono nombre="exclamation-circle" /> {error}</span>
          <Button size="sm" variant="outline-danger" onClick={cargar}>Reintentar</Button>
        </Alert>
      ) : (
        <Row xs={1} sm={2} lg={3} xl={4} className="g-3">
          {mascotas.map((m) => (
            <Col key={m.id_mascotas ?? m.id_mascota ?? m.id}>
              <MascotaCard mascota={m} onVerPerfil={setMascotaSeleccionada} />
            </Col>
          ))}
          <Col>
            <button type="button" className="tarjeta-agregar" onClick={abrirRegistro}>
              <span className="tarjeta-agregar-icono"><Icono nombre="plus-circle" /></span>
              <span className="tarjeta-agregar-titulo">Agregar mascota</span>
              <span className="tarjeta-agregar-sub">
                {mascotas.length ? 'Publicar en adopción' : 'Aún no tienes mascotas registradas'}
              </span>
            </button>
          </Col>
        </Row>
      )}

      {mostrarModalRegistro && (
        <RegistrarMascotaModal onClose={cerrarRegistro} onGuardar={handleGuardarMascota} />
      )}

      {mascotaSeleccionada && (
        <PerfilMascotaModal mascota={mascotaSeleccionada} onClose={() => setMascotaSeleccionada(null)} />
      )}
    </Container>
  );
}
