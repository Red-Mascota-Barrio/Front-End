import { useState } from "react";

function ComentarioForm({ onAgregarComentario }) {
  const [contenido, setContenido] = useState("");
  const [enviando, setEnviando] = useState(false);

    const manejarComentario = async (e) => {
    e.preventDefault();

    if (!contenido.trim()) return;

    try {
      setEnviando(true);
      await onAgregarComentario({
        contenido: contenido.trim(),
        comentario: contenido.trim()
      });
      setContenido("");
    } catch (error) {
      console.error("Error al enviar el comentario:", error);
      alert("No se pudo publicar el comentario. Revisa la consola para más detalles.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form className="comentario-form" onSubmit={manejarComentario}>
      <label htmlFor="comentario">Escribe tu comentario</label>

      <textarea
        id="comentario"
        rows="4"
        placeholder="Escribe tu comentario..."
        value={contenido}
        onChange={(e) => setContenido(e.target.value)}
        disabled={enviando}
        required
      />

      <button
        type="submit"
        className="btn-publicar-comentario"
        disabled={enviando}
      >
        {enviando ? "Publicando..." : "Publicar comentario"}
      </button>
    </form>
  );
}

export default ComentarioForm;