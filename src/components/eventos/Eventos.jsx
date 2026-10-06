import { useState, useEffect } from 'react';
import { getEventos, inscribirEvento } from '../../services/api';
import EventoCard from './EventoCard';
import VistaCalendario from './VistaCalendario';
import InscripcionModal from './InscripcionModal';

export default function Eventos() {
  const [eventos, setEventos] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [modoVista, setModoVista] = useState('tarjetas');
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);

  // Solución al error: cargarEventos definido dentro del useEffect//
  useEffect(() => {
    const cargarEventos = async () => {
      const data = await getEventos();
      setEventos(data);
    };

    cargarEventos();
  }, []);

  const handleInscribir = async (id) => {
    await inscribirEvento(id);
    setEventos((prevEventos) =>
      prevEventos.map((e) =>
        e.id === id
          ? { ...e, inscrito: true, cuposOcupados: e.cuposOcupados + 1 }
          : e
      )
    );
    setEventoSeleccionado(null);
  };

  const eventosFiltrados = eventos.filter(
    (e) => filtroTipo === 'Todos' || e.tipo === filtroTipo
  );

  const eventoDestacado = eventos.find((e) => e.destacado);

  return (
    <div className="container py-4">
      // Encabezado y cambio de vista //
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Módulo de Eventos</h2>
        <button
          className="btn btn-outline-primary"
          onClick={() => setModoVista(modoVista === 'tarjetas' ? 'calendario' : 'tarjetas')}
        >
          {modoVista === 'tarjetas' ? 'Ver Calendario' : 'Ver Tarjetas'}
        </button>
      </div>

      // Sección Evento Destacado //
      {eventoDestacado && modoVista === 'tarjetas' && (
        <div className="mb-4">
          <h4>Evento Destacado</h4>
          <EventoCard
            evento={eventoDestacado}
            onInscribir={setEventoSeleccionado}
          />
        </div>
      )}

      //Filtros por tipo de evento //
      <div className="btn-group mb-4" role="group">
        {['Todos', 'Jornada', 'Taller', 'Campaña'].map((tipo) => (
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

      // Vista de Tarjetas o Calendario //
      {modoVista === 'tarjetas' ? (
        <div className="row g-3">
          {eventosFiltrados.map((evt) => (
            <div key={evt.id} className="col-12 col-md-6 col-lg-4">
              <EventoCard
                evento={evt}
                onInscribir={setEventoSeleccionado}
              />
            </div>
          ))}
        </div>
      ) : (
        <VistaCalendario
          eventos={eventosFiltrados}
          onInscribir={setEventoSeleccionado}
        />
      )}

      // Modal de Inscripción //
      {eventoSeleccionado && (
        <InscripcionModal
          evento={eventoSeleccionado}
          onClose={() => setEventoSeleccionado(null)}
          onConfirmar={handleInscribir}
        />
      )}
    </div>
  );
}

