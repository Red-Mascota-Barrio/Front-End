import { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";

function CrearHiloModal({ onCerrar, onCrearHilo }) {
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [contenido, setContenido] = useState("");

  const manejarPublicacion = async (e) => {
    e.preventDefault();

    if (!titulo.trim() || !contenido.trim()) {
      alert("Completa el título y el contenido.");
      return;
    }

    const nuevoHilo = {
      titulo: titulo.trim(),
      contenido: contenido.trim(),
      categoria_foro_id: Number(categoria) || 1,
    };

    try {
      const respuesta = await foroService.crear(nuevoHilo);

      if (respuesta.resultado === "ok") {
        onCrearHilo(respuesta.datos);
        onCerrar();
      } else {
        alert(respuesta.mensaje || "No se pudo publicar el hilo.");
      }
    } catch (error) {
      console.error("Error al publicar el hilo:", error);
      console.error("Estado HTTP:", error.response?.status);
      console.error("Respuesta de Laravel:", error.response?.data);

      if (error.response) {
        alert(
          "Error HTTP: " +
            error.response.status +
            "\n" +
            JSON.stringify(error.response.data, null, 2),
        );
      } else {
        alert(
          "No se recibió respuesta del servidor. Revisa la conexión con Laravel.",
        );
      }
    }
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
              placeholder="Escribe el título"
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