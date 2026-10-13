import { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";

function CrearHiloModal({ onCerrar, onCrearHilo }) {
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("general");
  const [contenido, setContenido] = useState("");

  const manejarPublicacion = (e) => {
    e.preventDefault();

    if (!titulo.trim() || !contenido.trim()) {
      return;
    }

    const nuevoHilo = {
      id: Date.now(),
      titulo: titulo,
      contenido: contenido,
      categoria: categoria,
      autor: "Usuario actual",
      respuestas: 0,
      visitas: 0,
      destacado: false,
    };

    onCrearHilo(nuevoHilo);

    onCerrar();
  };

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
            <Form.Label className="fw-bold text-dark small">Categoría</Form.Label>
            <Form.Select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="shadow-none"
            >
              <option value="general">General</option>
              <option value="estudio">Estudio</option>
              <option value="proyectos">Proyectos</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="contenido">
            <Form.Label className="fw-bold text-dark small">Contenido</Form.Label>
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