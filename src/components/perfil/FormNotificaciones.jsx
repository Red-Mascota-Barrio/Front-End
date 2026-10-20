import { useEffect, useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { perfilService } from '../../services/perfilService';
import { mensajeError } from '../../utils/perfil';

// Columnas de preferencias_notificacion (PreferenciaNotificacionController@update)
const TIPOS = [
  { campo: 'notificar_adopcion', titulo: 'Adopciones', detalle: 'Cuando alguien solicita adoptar una de tus mascotas.' },
  { campo: 'notificar_foro', titulo: 'Foro', detalle: 'Cuando comentan tus publicaciones en el foro.' },
  { campo: 'notificar_evento', titulo: 'Eventos', detalle: 'Cambios en los eventos a los que estás inscrito.' },
  { campo: 'notificar_reporte', titulo: 'Reportes', detalle: 'Novedades sobre reportes que hiciste o recibiste.' },
];

const FRECUENCIAS = [
  { valor: 'inmediata', texto: 'Inmediata' },
  { valor: 'diaria', texto: 'Resumen diario' },
  { valor: 'semanal', texto: 'Resumen semanal' },
];

const POR_DEFECTO = { ...Object.fromEntries(TIPOS.map((t) => [t.campo, true])), frecuencia: 'inmediata' };

export const FormNotificaciones = () => {
  const [prefs, setPrefs] = useState(POR_DEFECTO);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    perfilService
      .obtenerPreferencias()
      .then((data) => {
        if (!data || typeof data !== 'object') return;
        setPrefs((previo) => ({
          ...previo,
          ...Object.fromEntries(TIPOS.filter((t) => t.campo in data).map((t) => [t.campo, Boolean(Number(data[t.campo]))])),
          frecuencia: data.frecuencia ?? previo.frecuencia,
        }));
      })
      .catch(() => setMensaje({ tipo: 'warning', texto: 'No se pudieron cargar tus preferencias; se muestran los valores por defecto.' }))
      .finally(() => setCargando(false));
  }, []);

  const guardar = async () => {
    try {
      setGuardando(true);
      setMensaje(null);
      await perfilService.guardarPreferencias(prefs);
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
        <Spinner animation="border" role="status" />
        <p className="mt-2 text-muted small">Cargando preferencias…</p>
      </div>
    );
  }

  return (
    <section className="perfil-seccion">
      <div className="perfil-seccion-header">
        <h2>Preferencias de notificación</h2>
        <p>Elige qué avisos quieres recibir y con qué frecuencia.</p>
      </div>
      <div className="perfil-seccion-body">
        {mensaje && <Alert variant={mensaje.tipo}>{mensaje.texto}</Alert>}

        <div className="mb-4">
          {TIPOS.map(({ campo, titulo, detalle }) => (
            <div key={campo} className="notif-item">
              <label htmlFor={`pref-${campo}`} className="flex-grow-1 cursor-pointer">
                <div className="notif-item-titulo">{titulo}</div>
                <div className="notif-item-sub">{detalle}</div>
              </label>
              <Form.Check
                type="switch"
                id={`pref-${campo}`}
                checked={prefs[campo]}
                onChange={(e) => setPrefs((p) => ({ ...p, [campo]: e.target.checked }))}
                aria-label={titulo}
                className="mb-0"
              />
            </div>
          ))}
        </div>

        <Form.Group controlId="frecuencia" className="mb-4" style={{ maxWidth: 280 }}>
          <Form.Label>Frecuencia</Form.Label>
          <Form.Select value={prefs.frecuencia} onChange={(e) => setPrefs((p) => ({ ...p, frecuencia: e.target.value }))}>
            {FRECUENCIAS.map((f) => <option key={f.valor} value={f.valor}>{f.texto}</option>)}
          </Form.Select>
        </Form.Group>

        <div className="d-flex justify-content-end">
          <Button variant="primary" onClick={guardar} disabled={guardando}>
            {guardando ? 'Guardando…' : 'Guardar preferencias'}
          </Button>
        </div>
      </div>
    </section>
  );
};
