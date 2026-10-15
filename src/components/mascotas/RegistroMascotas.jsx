import { useState, useEffect, useCallback } from 'react';
import { mascotasService } from '../../services/mascotasService';
import MascotaCard from './MascotaCard';
import RegistrarMascotaModal from './RegistrarMascotaModal';
import PerfilMascotaModal from './PerfilMascotaModal';

export default function RegistroMascotas() {
  const [mascotas, setMascotas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarModalRegistro, setMostrarModalRegistro] = useState(false);
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await mascotasService.listar();
      setMascotas(data);
    } catch (err) {
      console.error('Error al obtener mascotas:', err);
      setError('No se pudieron cargar las mascotas desde la base de datos.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void cargar();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [cargar]);

  const handleGuardarMascota = async (datosNuevos) => {
    try {
      await mascotasService.crear(datosNuevos);
      setMostrarModalRegistro(false);
      await cargar();
    } catch (err) {
      console.error('Error al registrar mascota:', err);
      setError('No se pudo registrar la mascota.');
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Módulo de Mascotas</h2>
        <button
          className="btn btn-primary"
          onClick={() => setMostrarModalRegistro(true)}
        >
          + Registrar Mascota
        </button>
      </div>

      {cargando && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted">Cargando datos desde el servidor...</p>
        </div>
      )}

      {error && !cargando && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!cargando && !error && (
        <div className="row g-4">
          {mascotas.length === 0 ? (
            <div className="col-12 text-center py-5 text-muted">
              <p>No hay mascotas registradas en la base de datos.</p>
            </div>
          ) : (
            mascotas.map((m) => (
              <div key={m.id || m._id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <MascotaCard
                  mascota={m}
                  onVerPerfil={setMascotaSeleccionada}
                />
              </div>
            ))
          )}
        </div>
      )}

      {mostrarModalRegistro && (
        <RegistrarMascotaModal
          onClose={() => setMostrarModalRegistro(false)}
          onGuardar={handleGuardarMascota}
        />
      )}

      {mascotaSeleccionada && (
        <PerfilMascotaModal
          mascota={mascotaSeleccionada}
          onClose={() => setMascotaSeleccionada(null)}
        />
      )}
    </div>
  );
}

