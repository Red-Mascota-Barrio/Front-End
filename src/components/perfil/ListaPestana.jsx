import { useEffect, useState } from 'react';
import { Spinner, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Icono } from '../common/Icono';

// Carga una lista desde el servicio y maneja estados de carga / error / vacío.
// `vacio` acepta un texto o { icono (Bootstrap Icons), titulo, sub, accion: { texto, to } }.
export const ListaPestana = ({ cargar, vacio, children }) => {
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let activo = true;
    cargar()
      .then((data) => activo && setItems(Array.isArray(data) ? data : data?.data ?? []))
      .catch(() => activo && setError(true))
      .finally(() => activo && setCargando(false));
    return () => { activo = false; };
  }, [cargar]);

  if (cargando) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" />
        <p className="mt-2 text-muted small">Cargando contenido…</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger" className="text-center"><Icono nombre="exclamation-circle" /> No se pudo cargar la información. Intenta de nuevo más tarde.</Alert>;
  }

  if (items.length === 0) {
    const v = typeof vacio === 'string' ? { titulo: vacio } : vacio ?? {};
    return (
      <div className="perfil-tab-vacio">
        {v.icono && <div className="perfil-tab-vacio-icono"><Icono nombre={v.icono} /></div>}
        <p className="perfil-tab-vacio-titulo">{v.titulo}</p>
        {v.sub && <p className="perfil-tab-vacio-sub">{v.sub}</p>}
        {v.accion && (
          v.accion.onClick ? (
            <Button variant="primary" onClick={v.accion.onClick}>{v.accion.texto}</Button>
          ) : (
            <Button as={Link} to={v.accion.to} variant="primary">{v.accion.texto}</Button>
          )
        )}
      </div>
    );
  }

  return children(items);
};
