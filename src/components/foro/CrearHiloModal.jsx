import { useState } from "react";

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
    <div className="modal-overlay">
      <div className="modal-foro">
        <div className="modal-header">
          <h2>Crear nuevo hilo</h2>

          <button className="btn-cerrar-modal" onClick={onCerrar}>
            ×
          </button>
        </div>

        <form className="form-hilo" onSubmit={manejarPublicacion}>
          <div className="campo-formulario">
            <label htmlFor="titulo">Título</label>

            <input
              id="titulo"
              type="text"
              placeholder="Escribe el título..."
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
          </div>

          <div className="campo-formulario">
            <label htmlFor="categoria">Categoría</label>

            <select
              id="categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option value="general">General</option>
              <option value="estudio">Estudio</option>
              <option value="proyectos">Proyectos</option>
            </select>
          </div>

          <div className="campo-formulario">
            <label htmlFor="contenido">Contenido</label>

            <textarea
              id="contenido"
              rows="6"
              placeholder="Escribe el contenido"
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
            />
          </div>

          <div className="modal-acciones">
            <button type="button" className="btn-cancelar" onClick={onCerrar}>
              Cancelar
            </button>

            <button type="submit" className="btn-publicar">
              Publicar hilo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CrearHiloModal;
