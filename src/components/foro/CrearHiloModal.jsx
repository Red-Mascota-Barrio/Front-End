import { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";

function CrearHiloModal({ onCerrar, onCrearHilo }) {
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [categoria, setCategoria] = useState('');
  const [categoriasList, setCategoriasList] = useState([]);
  const [loading, setLoading] = useState(true);

  const manejarPublicacion = (e) => {
    e.preventDefault();

    if (!titulo.trim() || !contenido.trim() || !categoria) {
      return;
    }

    const nuevoHilo = {
      id: Date.now(),
      titulo: titulo,
      contenido: contenido,
      categoria: categoria, // Esto enviará el id_categoria
      autor: "Usuario actual",
      respuestas: 0,
      visitas: 0,
      destacado: false,
    };

    onCrearHilo(nuevoHilo);
    onCerrar();
  };

  useEffect(() => {
    // Asegúrate de incluir /api/ si tu ruta de Laravel está en api.php
    fetch('http://127.0.0.1:8000/api/categorias') 
      .then((response) => {
        if (!response.ok) {
          console.log('no paso de aqui')
          throw new Error('Ruta no encontrada o error del servidor');
          
        } 
        console.log('paso de aqui')
        return response.json();
      })
      .then((data) => {
        // Obtenemos el arreglo (venga de data.datos o directo de data)
        const arrayCategorias = data.datos ? data.datos : data;
        
        // Si por alguna razón no es un array, guardamos un array vacío
        if (Array.isArray(arrayCategorias)) {
          setCategoriasList(arrayCategorias);
        }
        console.log('categorias: ', arrayCategorias); // Para depuración: ver qué se recibe
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error al cargar las categorías:', error);
        setCategoriasList([]); // Protección: asegura que siga siendo un array vacío
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
              disabled={loading}
            >
              <option value="">
                {loading
                  ? "Cargando categorías..."
                  : "Selecciona una categoría"}
              </option>

              {/* Usamos un "&&" para asegurarnos de que categoriasList existe y es un array antes de mapear */}
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