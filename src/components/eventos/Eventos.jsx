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
    <div className="container py-4">
      {/* Encabezado y cambio de vista */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="m-0">Eventos</h2>
        <button
          className="btn btn-outline-primary"
          onClick={() => setModoVista(modoVista === 'tarjetas' ? 'calendario' : 'tarjetas')}
        >
          {modoVista === 'tarjetas' ? 'Ver calendario' : 'Ver tarjetas'}
        </button>
      </div>

      {modoDemo && (
        <div className="alert alert-warning py-2 small">
          No se pudo conectar con el servidor: se muestran eventos de demostración.
        </div>
      )}

      {cargando ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted">Cargando eventos...</p>
        </div>
      ) : (
        <>
          {/* Evento destacado */}
          {eventoDestacado && modoVista === 'tarjetas' && (
            <div className="mb-4">
              <h4>Evento destacado</h4>
              <div className="row">
                <div className="col-12 col-md-8 col-lg-6">
                  <EventoCard evento={eventoDestacado} onInscribir={abrirInscripcion} />
                </div>
              </div>
            </div>
          )}

          {/* Filtros por tipo */}
          <div className="btn-group mb-4" role="group">
            {TIPOS.map((tipo) => (
              <button
                key={tipo}
                type="button"
                className={`btn ${filtroTipo === tipo ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setFiltroTipo(tipo)}
              >
                {tipo}
              </button>
            ))}
          </div>

          {/* Tarjetas o calendario */}
          {modoVista === 'tarjetas' ? (
            eventosFiltrados.length === 0 ? (
              <p className="text-muted">No hay eventos de este tipo por ahora.</p>
            ) : (
              <div className="row g-3">
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
