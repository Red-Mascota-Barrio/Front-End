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

  if (cargando) return <div className="text-center py-4"><Spinner animation="border" className="perfil-spinner" /></div>;

  return (
    <div>
      <h5 className="fw-bold mb-3">Preferencias de notificación</h5>
      {mensaje && <Alert variant={mensaje.tipo} className="py-2 small">{mensaje.texto}</Alert>}

      {TIPOS.map(({ tipo, titulo, detalle }) => (
        <div className="perfil-pref" key={tipo}>
          <div>
            <strong>{titulo}</strong>
            <div className="small text-muted">{detalle}</div>
          </div>
          <Form.Check
            type="switch"
            id={`pref-${tipo}`}
            checked={prefs[tipo]}
            onChange={(e) => setPrefs((p) => ({ ...p, [tipo]: e.target.checked }))}
            aria-label={titulo}
          />
        </div>
      ))}

      <Button className="btn-cta mt-3" onClick={guardar} disabled={guardando}>
        {guardando ? 'Guardando...' : 'Guardar preferencias'}
      </Button>
    </div>
  );
};
