import { useState } from "react";
import { Form, Button } from "react-bootstrap";

function ComentarioForm({ onAgregarComentario }) {
  const [contenido, setContenido] = useState("");

  const manejarComentario = (e) => {
    e.preventDefault();

    if (!contenido.trim()) {
      return;
    }

    const nuevoComentario = {
      id: Date.now(),
      autor: "Usuario actual",
      contenido: contenido,
      fecha: "Ahora",
    };

    onAgregarComentario(nuevoComentario);

    setContenido("");
  };

  return (
    <Form onSubmit={manejarComentario} className="card shadow-sm border-0 rounded-4 p-4 bg-white mb-4">
      <Form.Group className="mb-3" controlId="comentario">
        <Form.Label className="fw-bold text-dark small">Escribe tu comentario</Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          placeholder="Comparte tu opinión o consejo..."
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          className="shadow-none border-secondary-subtle"
        />
      </Form.Group>

      <div className="text-end">
        <Button
          type="submit"
          variant="primary"
          className="rounded-pill px-4 py-2 shadow-sm fw-medium"
        >
          Publicar comentario
        </Button>
      </div>
    </Form>
  );
}

export default ComentarioForm;