import { useCallback, useEffect, useRef, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { notificacionesService, haceCuanto } from '../../services/notificacionesService';

// Cada cuánto se revisa si hay notificaciones nuevas (ms)
const INTERVALO = 30000;

/**
 * Campana de notificaciones del navbar.
 * - Consulta el número de no leídas cada 30 s y al volver a la pestaña.
 * - Al abrirla trae las últimas notificaciones.
 * - Clic en una la marca como leída; "Marcar todas" las deja en 0.
 *
 * No usa <Dropdown> de react-bootstrap a propósito: main.jsx carga también el
 * JavaScript de Bootstrap, que escucha las teclas sobre cualquier .dropdown-menu
 * y lanzaba un error al presionar Escape dentro del menú.
 */
export const NotificacionesCampana = () => {
  const [noLeidas, setNoLeidas] = useState(0);
  const [lista, setLista] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(false);
  const [abierta, setAbierta] = useState(false);
  const abiertaRef = useRef(false);
  const contenedor = useRef(null);
  const boton = useRef(null);

  const actualizarContador = useCallback(async () => {
    try {
      setNoLeidas(await notificacionesService.contarNoLeidas());
    } catch {
      /* sin conexión o sesión vencida: se reintenta en el próximo ciclo */
    }
  }, []);

  const cargarLista = useCallback(async () => {
    setCargando(true);
    setError(false);
    try {
      const [datos, total] = await Promise.all([
        notificacionesService.listar(15),
        notificacionesService.contarNoLeidas(),
      ]);
      setLista(datos);
      setNoLeidas(total);
    } catch {
      setError(true);
    } finally {
      setCargando(false);
    }
  }, []);

  // Sondeo periódico + al volver a la pestaña
  useEffect(() => {
    (async () => {
      try {
        setNoLeidas(await notificacionesService.contarNoLeidas());
      } catch {
        /* se reintenta en el próximo ciclo */
      }
    })();
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') {
        if (abiertaRef.current) cargarLista();
        else actualizarContador();
      }
    }, INTERVALO);
    const alVolver = () => document.visibilityState === 'visible' && actualizarContador();
    document.addEventListener('visibilitychange', alVolver);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', alVolver);
    };
  }, [actualizarContador, cargarLista]);

  const alAbrir = useCallback((abrir) => {
    abiertaRef.current = abrir;
    setAbierta(abrir);
    if (abrir) cargarLista();
  }, [cargarLista]);

  // Cerrar con clic afuera o con Escape (devolviendo el foco a la campana)
  useEffect(() => {
    if (!abierta) return undefined;
    const clicAfuera = (e) => {
      if (contenedor.current && !contenedor.current.contains(e.target)) alAbrir(false);
    };
    const tecla = (e) => {
      if (e.key === 'Escape') {
        alAbrir(false);
        boton.current?.focus();
      }
    };
    document.addEventListener('mousedown', clicAfuera);
    document.addEventListener('keydown', tecla);
    return () => {
      document.removeEventListener('mousedown', clicAfuera);
      document.removeEventListener('keydown', tecla);
    };
  }, [abierta, alAbrir]);

  const marcarLeida = async (n) => {
    if (n.leido) return;
    setLista((l) => l.map((x) => (x.id_notificacion === n.id_notificacion ? { ...x, leido: true } : x)));
    setNoLeidas((c) => Math.max(0, c - 1));
    try {
      await notificacionesService.marcarLeida(n.id_notificacion);
    } catch {
      actualizarContador();
    }
  };

  const marcarTodas = async () => {
    setLista((l) => l.map((x) => ({ ...x, leido: true })));
    setNoLeidas(0);
    try {
      await notificacionesService.marcarTodasLeidas();
    } catch {
      cargarLista();
    }
  };

  return (
    <div className="campana" ref={contenedor}>
      <button
        ref={boton}
        type="button"
        className="campana-boton"
        onClick={() => alAbrir(!abierta)}
        aria-haspopup="true"
        aria-expanded={abierta}
        aria-label={noLeidas ? `Notificaciones, ${noLeidas} sin leer` : 'Notificaciones'}
      >
        <i className="bi bi-bell" aria-hidden="true" />
        {noLeidas > 0 && <span className="campana-globo">{noLeidas > 99 ? '99+' : noLeidas}</span>}
      </button>

      {abierta && (
      <div className="campana-menu" role="dialog" aria-label="Notificaciones">
        <div className="campana-cabecera">
          <strong>Notificaciones</strong>
          {noLeidas > 0 && (
            <button type="button" className="campana-marcar" onClick={marcarTodas}>
              Marcar como leídas
            </button>
          )}
        </div>

        <div className="campana-lista">
          {cargando && lista.length === 0 ? (
            <div className="text-center py-4"><Spinner animation="border" size="sm" variant="success" /></div>
          ) : error ? (
            <div className="campana-vacio">No pudimos cargar tus notificaciones.</div>
          ) : lista.length === 0 ? (
            <div className="campana-vacio">No tienes notificaciones.</div>
          ) : (
            lista.map((n) => (
              <button
                key={n.id_notificacion}
                type="button"
                className={`campana-item${n.leido ? '' : ' no-leida'}`}
                onClick={() => marcarLeida(n)}
              >
                <span className="campana-texto">
                  {n.titulo && <strong>{n.titulo}</strong>}
                  <span>{n.mensaje}</span>
                  <small>{haceCuanto(n.created_at)}</small>
                </span>
              </button>
            ))
          )}
        </div>

        <Link to="/perfil/editar?tab=notificaciones" className="campana-pie" onClick={() => alAbrir(false)}>
          Preferencias de notificación
        </Link>
      </div>
      )}
    </div>
  );
};
