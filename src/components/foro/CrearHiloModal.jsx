import { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { foroService } from "../../services/foroService";

function CrearHiloModal({ onCerrar, onCrearHilo }) {
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [categoria, setCategoria] = useState('');
  
  // Estados para manejar las categorías y la carga
  const [categoriasList, setCategoriasList] = useState([]); 
  const [loading, setLoading] = useState(true);

  // Manejar el envío del formulario
  const manejarPublicacion = async (e) => {
    e.preventDefault();

    // Validar que los campos no estén vacíos
    if (!titulo.trim() || !contenido.trim() || !categoria) {
      return;
    }

    const nuevoHilo = {
      id: Date.now(),
      titulo: titulo,
      contenido: contenido,
      categoria_foro_id: categoria, // Enviamos el ID de la categoría al backend
      autor: "Usuario actual",
      respuestas: 0,
      visitas: 0,
      destacado: false,
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

  // Traer las categorías desde el backend
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/categorias')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error al cargar categorías');
        }
        return response.json();
      })
      .then((data) => {
        // Aseguramos obtener el arreglo ya sea de data.datos o directo
        const arrayCategorias = data.datos ? data.datos : data;
        
        // Protección vital: Solo guardamos si es un arreglo válido
        if (Array.isArray(arrayCategorias)) {
          setCategoriasList(arrayCategorias);
        } else {
          setCategoriasList([]);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error en fetch de categorías:', error);
        setCategoriasList([]); // Evita que el .map() rompa la página
        setLoading(false);
      });
  }, []);

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