import { useState, useEffect } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import { foroService } from "../../services/foroService";
import { categoriasDesdeHilos } from "../../utils/foro";
import { Icono } from "../common/Icono";


function CrearHiloModal({ onCerrar, onCrearHilo, categorias = [] }) {
  const [listaCategorias, setListaCategorias] = useState(categorias);
  
  // Si no hay categorías pasadas por props ni cargadas, usamos el fallback
  const opciones = listaCategorias.length ? listaCategorias : categoriasDesdeHilos();

  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  
  // CORRECCIÓN 1: Se separa el estado de la 'categoria' seleccionada del actualizador correcto
  const [categoria, setCategoria] = useState(String(opciones[0]?.id_categoria ?? ""));
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  
  // CORRECCIÓN 2: Creamos el estado 'loading' que te faltaba para la carga inicial de la API
  const [loading, setLoading] = useState(true);

  // Manejar el envío del formulario
  const manejarPublicacion = async (e) => {
    e.preventDefault();
    if (!titulo.trim() || !contenido.trim() || !categoria) {
      setError("Completa el título, la categoría y el contenido.");
      return;
    }

    const nuevoHilo = {
      titulo: titulo.trim(),
      contenido: contenido.trim(),
      categoria_foro_id: Number(categoria),
    };

    try {
      setEnviando(true);
      setError(null);
      const respuesta = await foroService.crear(nuevoHilo);

      if (respuesta.resultado === "ok" || respuesta.datos) {
        onCrearHilo(respuesta.datos);
        onCerrar();
      } else {
        setError(respuesta.mensaje || "No se pudo publicar el foro.");
      }
    } catch (err) {
      console.error("Error al publicar el hilo:", err.response?.data ?? err);
      const data = err.response?.data;
      const validacion = data?.errors ?? data?.errores;
      if (err.response?.status === 401) setError("Debes iniciar sesión para publicar un hilo.");
      else if ([409, 429].includes(err.response?.status)) setError(data?.mensaje);
      else if (validacion) setError(Object.values(validacion).flat().join(" "));
      else if (err.response) setError(data?.mensaje || data?.message || `Error del servidor (${err.response.status}).`);
      else setError("No se recibió respuesta del servidor.");
    } finally {
      setEnviando(false);
    }
  };

  // Traer las categorías desde el backend
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/categorias')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error al cargar categorías');
        }
        return response.json();
      })
      .then((data) => {
        const arrayCategorias = data.datos ? data.datos : data;
        
        if (Array.isArray(arrayCategorias)) {
          setListaCategorias(arrayCategorias);
          // Auto-seleccionar la primera categoría si llega desde la API
          if (arrayCategorias.length > 0) {
            setCategoria(String(arrayCategorias[0].id_categoria));
          }
        } else {
          setListaCategorias([]);
        }
        setLoading(false); // Ahora sí funcionará porque el estado existe arriba
      })
      .catch((error) => {
        console.error('Error en fetch de categorías:', error);
        setListaCategorias([]); 
        setLoading(false);
      });
  }, []);

  return (
    <Modal show onHide={enviando ? undefined : onCerrar} centered>
      <Modal.Header closeButton={!enviando}>
        <Modal.Title as="h2" className="h5 mb-0">Crear nuevo foro</Modal.Title>
      </Modal.Header>

      <Form onSubmit={manejarPublicacion} noValidate>
        <Modal.Body>
          {error && <Alert variant="danger"><Icono nombre="exclamation-circle" /> {error}</Alert>}

          <Form.Group className="mb-3" controlId="titulo">
            <Form.Label>Título</Form.Label>
            <Form.Control
              type="text"
              placeholder="¿Sobre qué quieres hablar?"
              maxLength={255}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="categoria">
            <Form.Label>Categoría {loading && "(Cargando...)"}</Form.Label>
            <Form.Select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              {opciones.map((cat) => (
                <option key={cat.id_categoria} value={cat.id_categoria}>
                  {cat.nombre_categoria}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group controlId="contenido">
            <Form.Label>Contenido</Form.Label>
            <Form.Control
              as="textarea"
              rows={6}
              placeholder="Cuenta tu experiencia o tu pregunta con detalle"
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              required
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="light" onClick={onCerrar} disabled={enviando}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={enviando || loading}>
            {enviando ? "Publicando" : "Publicar foro"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default CrearHiloModal;
