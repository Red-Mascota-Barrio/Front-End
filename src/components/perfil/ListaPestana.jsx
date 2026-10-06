import { useEffect, useState } from 'react';
import { Spinner, Alert } from 'react-bootstrap';

// Carga una lista desde el servicio y maneja estados de carga / error / vacío.
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

  if (cargando) return <div className="text-center py-5"><Spinner animation="border" className="perfil-spinner" /></div>;
  if (error) return <Alert variant="danger">No se pudo cargar la información. Intenta de nuevo más tarde.</Alert>;
  if (items.length === 0) return <div className="perfil-vacio">{vacio}</div>;
  return children(items);
};
