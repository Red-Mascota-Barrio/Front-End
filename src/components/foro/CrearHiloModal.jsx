import { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";

function CrearHiloModal({ onCerrar, onCrearHilo }) {
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [categoria, setCategoria] = useState('');
  
  // Estados para manejar las categorías y la carga
  const [categoriasList, setCategoriasList] = useState([]); 
  const [loading, setLoading] = useState(true);

  // Manejar el envío del formulario
  const manejarPublicacion = (e) => {
    e.preventDefault();

    // Validar que los campos no estén vacíos
    if (!titulo.trim() || !contenido.trim() || !categoria) {
      return;
    }

    const nuevoHilo = {
      id: Date.now(),
      titulo: titulo,
      contenido: contenido,
      categoria_foro_id: categoria, // Enviamos el ID de la categoría al backend
      autor: "Usuario actual",
      respuestas: 0,
      visitas: 0,
      destacado: false,
    };

    onCrearHilo(nuevoHilo);
    onCerrar();
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
        // Aseguramos obtener el arreglo ya sea de data.datos o directo
        const arrayCategorias = data.datos ? data.datos : data;
        
        // Protección vital: Solo guardamos si es un arreglo válido
        if (Array.isArray(arrayCategorias)) {
          setCategoriasList(arrayCategorias);
        } else {
          setCategoriasList([]);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error en fetch de categorías:', error);
        setCategoriasList([]); // Evita que el .map() rompa la página
        setLoading(false);
      });
  }, []);

  return (
    <Modal show={true} onHide={onCerrar} centered backdrop="static">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">Crear nuevo hilo</Modal.Title>
      </Modal.Header>

      <Form onSubmit={manejarPublicacion}>
        <Modal.Body className="pt-3">
          
          <Form.Group className="mb-3" controlId="titulo">
            <Form.Label className="fw-bold text-dark small">Título</Form.Label>
            <Form.Control
              type="text"
              placeholder="Escribe el título..."
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="shadow-none"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="categoria">
            <Form.Label className="fw-bold text-dark small">
              Categoría
            </Form.Label>
            <Form.Select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="shadow-none"
              disabled={loading} // Bloquea el select mientras carga
            >
              <option value="">
                {loading
                  ? "Cargando categorías..."
                  : "Selecciona una categoría"}
              </option>

              {/* Mapeo protegido con las llaves de tu Base de Datos */}
              {Array.isArray(categoriasList) && categoriasList.map((cat) => (
                <option key={cat.id_categoria} value={cat.id_categoria}>
                  {cat.nombre_categoria}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="contenido">
            <Form.Label className="fw-bold text-dark small">
              Contenido
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              placeholder="Escribe el contenido..."
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              className="shadow-none"
            />
          </Form.Group>

        </Modal.Body>

        <Modal.Footer className="border-0 pt-0">
          <Button
            variant="light"
            className="rounded-pill px-4 text-secondary border"
            onClick={onCerrar}
            type="button"
          >
            Cancelar
          </Button>

          <Button
            variant="primary"
            className="rounded-pill px-4 shadow-sm fw-medium"
            type="submit"
          >
            Publicar hilo
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default CrearHiloModal;