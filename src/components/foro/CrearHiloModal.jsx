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
          "No se recibió respuesta del servidor.",
        );
      }
    }
  };

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">Crear nuevo hilo</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onCerrar}
            ></button>
          </div>

          <form onSubmit={manejarPublicacion}>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="titulo" className="form-label fw-semibold">
                  Título
                </label>
                <input
                  id="titulo"
                  type="text"
                  className="form-control"
                  placeholder="Escribe el título"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="categoria" className="form-label fw-semibold">
                  Categoría
                </label>
                <select
                  id="categoria"
                  className="form-select"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                >
                  <option value="1">Perro</option>
                  <option value="2">Gato</option>
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="contenido" className="form-label fw-semibold">
                  Contenido
                </label>
                <textarea
                  id="contenido"
                  className="form-control"
                  rows="6"
                  placeholder="Escribe el contenido"
                  value={contenido}
                  onChange={(e) => setContenido(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-light border"
                onClick={onCerrar}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Publicar hilo
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CrearHiloModal;