import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import { iniciales, urlFoto } from "../../utils/perfil";

function ComentarioForm({ onAgregarComentario }) {
  const { token, user } = useAuth();
  const [contenido, setContenido] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (!token) {
    return (
      <div className="caja-nuevo-comentario align-items-center justify-content-between flex-wrap">
        <span className="text-muted small">Inicia sesión para unirte a la conversación.</span>
        <Button as={Link} to="/login" size="sm" variant="primary">Iniciar sesión</Button>
      </div>
    );
  }

  const manejarComentario = async (e) => {
    e.preventDefault();
    if (!contenido.trim()) return;

    try {
      setEnviando(true);
      // El padre muestra el error si falla; solo limpiamos si se publicó
      const ok = await onAgregarComentario({ contenido: contenido.trim(), comentario: contenido.trim() });
      if (ok !== false) setContenido("");
    } finally {
      setEnviando(false);
    }
  };

  const foto = urlFoto(user);

  return (
    <form className="caja-nuevo-comentario" onSubmit={manejarComentario}>
      <div className="avatar-gradiente" aria-hidden="true">
        {foto ? <img src={foto} alt="" /> : iniciales(user)}
      </div>
      <div className="flex-grow-1 d-flex flex-column gap-2">
        <label htmlFor="comentario" className="visually-hidden">Escribe tu comentario</label>
        <textarea
          id="comentario"
          className="form-control"
          rows="3"
          placeholder="Escribe tu respuesta…"
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          disabled={enviando}
          required
        />
        <div className="d-flex justify-content-end">
          <Button type="submit" variant="primary" disabled={enviando || !contenido.trim()}>
            {enviando ? "Publicando…" : "Publicar comentario"}
          </Button>
        </div>
      </div>
    </form>
  );
}

export default ComentarioForm;
