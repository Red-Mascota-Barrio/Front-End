import { useState } from "react";
import { foroService } from "../../services/foroService";

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
    <div className="modal-overlay">
      <div className="modal-foro">
        <div className="modal-header">
          <h2>Crear nuevo hilo</h2>

          <button type="button" className="btn-cerrar-modal" onClick={onCerrar}>
            ×
          </button>
        </div>

        <form className="form-hilo" onSubmit={manejarPublicacion}>
          <div className="campo-formulario">
            <label htmlFor="titulo">Título</label>

            <input
              id="titulo"
              type="text"
              placeholder="Escribe el título"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>

          <div className="campo-formulario">
            <label htmlFor="categoria">Categoría</label>

            <select
              id="categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option value="1">Perro</option>
              <option value="2">Gato</option>
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
              required
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
