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
        comentario: contenido.trim(),
      });
      setContenido("");
    } catch (error) {
      console.error("Error al enviar el comentario:", error);
      alert(
        "No se pudo publicar el comentario. Revisa la consola para más detalles.",
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form className="card shadow-sm border-0 p-4" onSubmit={manejarComentario}>
      <div className="mb-3">
        <label htmlFor="comentario" className="form-label fw-bold text-dark">
          Escribe tu comentario
        </label>
        <textarea
          id="comentario"
          className="form-control"
          rows="4"
          placeholder="Escribe tu comentario"
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          disabled={enviando}
          required
        />
      </div>

      <div className="d-flex justify-content-end">
        <button
          type="submit"
          className="btn text-white fw-semibold px-4 py-2 rounded-pill shadow-sm"
          style={{ backgroundColor: "#0d9488", border: "none" }}
          disabled={enviando}
        >
          {enviando ? "Publicando..." : "Publicar comentario"}
        </button>
      </div>
    </form>
  );
}

export default ComentarioForm;
