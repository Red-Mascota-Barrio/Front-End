import { useState } from "react";

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
    <form
      className="comentario-form"
      onSubmit={manejarComentario}
    >
      <label htmlFor="comentario">
        Escribe tu comentario
      </label>

      <textarea
        id="comentario"
        rows="5"
        placeholder="Escribe tu comentario"
        value={contenido}
        onChange={(e) => setContenido(e.target.value)}
      />

      <button
        type="submit"
        className="btn-publicar-comentario"
      >
        Publicar comentario
      </button>
    </form>
  );
}

export default ComentarioForm;
