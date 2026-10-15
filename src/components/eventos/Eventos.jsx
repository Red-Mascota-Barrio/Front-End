import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { eventosService } from '../../services/eventosService';
import { useAuth } from '../../context/AuthContext';
import EventoCard from './EventoCard';
import VistaCalendario from './VistaCalendario';
import InscripcionModal from './InscripcionModal';

const TIPOS = ['Todos', 'Jornada', 'Taller', 'Campaña'];

export default function Eventos() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modoDemo, setModoDemo] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [modoVista, setModoVista] = useState('tarjetas');
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let activo = true;
    const cargarEventos = async () => {
      const { eventos: data, demo } = await eventosService.listar();
      if (!activo) return;
      setEventos(data);
      setModoDemo(demo);
      setCargando(false);
    };
    cargarEventos();
    return () => { activo = false; };
  }, []);

  // Para inscribirse hay que haber iniciado sesión
  const abrirInscripcion = (evento) => {
    if (!token) {
      Swal.fire({
        icon: 'info',
        title: 'Inicia sesión',
        text: 'Necesitas una cuenta para inscribirte a un evento.',
        confirmButtonText: 'Ir a iniciar sesión',
        showCancelButton: true,
        cancelButtonText: 'Ahora no',
      }).then((r) => r.isConfirmed && navigate('/login'));
      return;
    }
    setEventoSeleccionado(evento);
  };

  const handleInscribir = async (id) => {
    setEnviando(true);
    try {
      if (!modoDemo) await eventosService.inscribir(id);
      setEventos((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, inscrito: true, cuposOcupados: e.cuposOcupados + 1 } : e
        )
      );
      setEventoSeleccionado(null);
      Swal.fire({ icon: 'success', title: '¡Inscripción confirmada!', timer: 1800, showConfirmButton: false });
    } catch (error) {
      const msg = error.response?.data?.message || 'No se pudo completar la inscripción.';
      Swal.fire({ icon: 'error', title: 'Error', text: msg });
    } finally {
      setEnviando(false);
    }
  };

  const eventosFiltrados = eventos.filter(
    (e) => filtroTipo === 'Todos' || e.tipo === filtroTipo
  );
  const eventoDestacado = eventos.find((e) => e.destacado);

  return (
    <div className="container py-5">
      {/* Encabezado y cambio de vista */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold text-primary mb-1">Eventos y Jornadas</h2>
          <p className="text-muted small mb-0">Participa en nuestras actividades de bienestar animal y adopción.</p>
        </div>
        <button
          className="btn btn-outline-primary rounded-pill px-4 shadow-sm fw-medium"
          onClick={() => setModoVista(modoVista === 'tarjetas' ? 'calendario' : 'tarjetas')}
        >
          {modoVista === 'tarjetas' ? '📅 Ver calendario' : '🗂️ Ver tarjetas'}
        </button>
      </div>

      {modoDemo && (
        <div className="alert alert-warning py-2 small rounded-3 shadow-sm mb-4">
          ⚠️ No se pudo conectar con el servidor: se muestran eventos de demostración.
        </div>
      )}

      {cargando ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3 text-muted fw-medium">Cargando eventos...</p>
        </div>
      ) : (
        <>
          {/* Evento destacado */}
          {eventoDestacado && modoVista === 'tarjetas' && (
            <div className="mb-5">
              <h4 className="fw-bold text-dark mb-3">⭐ Evento Destacado</h4>
              <div className="row">
                <div className="col-12 col-md-8 col-lg-6">
                  <EventoCard evento={eventoDestacado} onInscribir={abrirInscripcion} />
                </div>
              </div>
            </div>
          )}

          {/* Filtros por tipo */}
          <div className="btn-group mb-4 shadow-sm rounded-pill p-1 bg-light border" role="group">
            {TIPOS.map((tipo) => (
              <button
                key={tipo}
                type="button"
                className={`btn rounded-pill px-4 fw-medium ${filtroTipo === tipo ? 'btn-primary shadow-sm' : 'btn-light text-secondary border-0'}`}
                onClick={() => setFiltroTipo(tipo)}
              >
                {tipo}
              </button>
            ))}
          </div>

          {/* Tarjetas o calendario */}
          {modoVista === 'tarjetas' ? (
            eventosFiltrados.length === 0 ? (
              <div className="card text-center py-5 border-0 bg-light rounded-4 my-4">
                <div className="card-body">
                  <p className="text-muted mb-0">No hay eventos de este tipo por ahora.</p>
                </div>
              </div>
            ) : (
              <div className="row g-4">
                {eventosFiltrados.map((evt) => (
                  <div key={evt.id} className="col-12 col-md-6 col-lg-4">
                    <EventoCard evento={evt} onInscribir={abrirInscripcion} />
                  </div>
                ))}
              </div>
            )
          ) : (
            <VistaCalendario eventos={eventosFiltrados} onInscribir={abrirInscripcion} />
          )}
        </>
      )}

      {/* Modal de inscripción */}
      {eventoSeleccionado && (
        <InscripcionModal
          evento={eventoSeleccionado}
          enviando={enviando}
          onClose={() => setEventoSeleccionado(null)}
          onConfirmar={handleInscribir}
        />
      )}
    </div>
  );
}