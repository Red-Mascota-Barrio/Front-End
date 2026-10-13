import { useEffect, useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { perfilService } from '../../services/perfilService';
import { mensajeError } from '../../utils/perfil';

// Tipos de notificación que genera el backend
const TIPOS = [
  { tipo: 'solicitud', titulo: 'Solicitudes de adopción', detalle: 'Cuando alguien solicita adoptar una de tus mascotas.' },
  { tipo: 'comentario', titulo: 'Comentarios', detalle: 'Cuando comentan tus publicaciones en el foro.' },
  { tipo: 'evento', titulo: 'Eventos', detalle: 'Cambios en los eventos a los que estás inscrito.' },
  { tipo: 'reporte', titulo: 'Reportes', detalle: 'Novedades sobre reportes que hiciste o recibiste.' },
];

export const FormNotificaciones = () => {
  const [prefs, setPrefs] = useState(() => Object.fromEntries(TIPOS.map((t) => [t.tipo, true])));
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    perfilService
      .obtenerPreferencias()
      .then((data) => {
        const lista = Array.isArray(data) ? data : data?.preferencias ?? [];
        if (lista.length) {
          setPrefs((previo) => ({ ...previo, ...Object.fromEntries(lista.map((p) => [p.tipo, Boolean(p.activo)])) }));
        }
      })
      .catch(() => setMensaje({ tipo: 'warning', texto: 'No se pudieron cargar tus preferencias; se muestran los valores por defecto.' }))
      .finally(() => setCargando(false));
  }, []);

  const guardar = async () => {
    try {
      setGuardando(true);
      setMensaje(null);
      await perfilService.guardarPreferencias(TIPOS.map(({ tipo }) => ({ tipo, activo: prefs[tipo] })));
      setMensaje({ tipo: 'success', texto: 'Preferencias de notificación guardadas.' });
    } catch (error) {
      setMensaje({ tipo: 'danger', texto: mensajeError(error, 'No se pudieron guardar las preferencias.') });
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" role="status" />
        <p className="mt-2 text-muted small">Cargando preferencias...</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-4 shadow-sm border">
      <h5 className="fw-bold mb-4 text-dark">Preferencias de notificación</h5>
      {mensaje && <Alert variant={mensaje.tipo} className="py-2 small rounded-3">{mensaje.texto}</Alert>}

      <div className="d-flex flex-column gap-3 mb-4">
        {TIPOS.map(({ tipo, titulo, detalle }) => (
          <div 
            key={tipo} 
            className="d-flex justify-content-between align-items-center p-3 bg-light rounded-3 border"
          >
            <div className="pe-3">
              <strong className="text-dark d-block mb-1">{titulo}</strong>
              <span className="text-muted small">{detalle}</span>
            </div>
            <Form.Check
              type="switch"
              id={`pref-${tipo}`}
              checked={prefs[tipo]}
              onChange={(e) => setPrefs((p) => ({ ...p, [tipo]: e.target.checked }))}
              aria-label={titulo}
              className="fs-5 cursor-pointer"
            />
          </div>
        ))}
      </div>

      <div className="d-grid">
        <Button 
          variant="primary" 
          className="rounded-pill py-2 shadow-sm fw-medium" 
          onClick={guardar} 
          disabled={guardando}
        >
          {guardando ? 'Guardando...' : 'Guardar preferencias'}
        </Button>
      </div>
    </div>
  );
};