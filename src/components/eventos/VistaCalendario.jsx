import { aFecha } from '../../utils/admin';
import { Icono } from '../common/Icono';
import EventoCard from './EventoCard';

// Vista de calendario: eventos ordenados por fecha y agrupados por mes
export default function VistaCalendario({ eventos, onInscribir, onCancelar }) {
  const ordenados = [...eventos].sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)));

  if (ordenados.length === 0) {
    return (
      <div className="estado-vacio">
        <div className="estado-vacio-icono"><Icono nombre="calendar-x" /></div>
        <h3>No hay eventos para mostrar</h3>
        <p>Prueba con otro tipo de evento.</p>
      </div>
    );
  }

  const grupos = ordenados.reduce((acc, evt) => {
    const d = aFecha(evt.fecha);
    const clave = d ? d.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }) : 'Sin fecha';
    (acc[clave] ??= []).push(evt);
    return acc;
  }, {});

  return (
    <div>
      {Object.entries(grupos).map(([mes, lista]) => (
        <section key={mes}>
          <h3 className="calendario-mes"><Icono nombre="calendar3" /> {mes}</h3>
          <div className="d-flex flex-column gap-2">
            {lista.map((evt) => (
              <EventoCard key={evt.id} evento={evt} onInscribir={onInscribir} onCancelar={onCancelar} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
