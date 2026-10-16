import { useState, useEffect } from "react";

import ForoHeader from "../../components/foro/ForoHeader";
import FiltrosForo from "../../components/foro/FiltrosForo";
import HiloCard from "../../components/foro/HiloCard";
import CrearHiloModal from "../../components/foro/CrearHiloModal";

import { AppNavbar } from "../../components/layout/AppNavbar";
import { Footer } from "../../components/layout/Footer";

import { foroService } from "../../services/foroService.js";
import "../../assets/foro/foro.css";

function Foro() {
  const [hilos, setHilos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("todas");
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    const cargarHilos = async () => {
      try {
        const respuesta = await foroService.listar();
        setHilos(respuesta.datos || respuesta.data || []);
      } catch (error) {
        console.error("Error al cargar los hilos:", error);
      }
    };

    cargarHilos();
  }, []);

  const hilosFiltrados = hilos.filter((hilo) => {
    const titulo = hilo?.titulo?.toLowerCase() || "";
    const contenido = hilo?.contenido?.toLowerCase() || "";
    
    // Mapeo seguro de la categoría desde Laravel
    const catTexto = (
      hilo?.categoriaForo?.nombre_categoria || 
      hilo?.categoria || 
      ""
    ).toLowerCase();

    const catId = Number(hilo?.categoria_foro_id || hilo?.id_categoria || 0);

    const textoBusqueda = busqueda.toLowerCase().trim();

    const coincideBusqueda =
      titulo.includes(textoBusqueda) || contenido.includes(textoBusqueda);

    const catSeleccionada = categoria.toLowerCase();

    const coincideCategoria =
      categoria === "todas" ||
      (catSeleccionada === "perro" && (catId === 1 || catTexto.includes("perro"))) ||
      // Si seleccionó Gato: valida si el ID es 2 o si el texto contiene "gato"
      (catSeleccionada === "gato" && (catId === 2 || catTexto.includes("gato"))) ||
      // Búsqueda general por si la categoría se llama distinto en base de datos
      catTexto.includes(catSeleccionada);

    return coincideBusqueda && coincideCategoria;
  });

  // Función para incorporar el hilo creado por CrearHiloModal sin re-hacer la petición
  const agregarNuevoHilo = (hiloCreado) => {
    if (hiloCreado) {
      setHilos((hilosActuales) => [hiloCreado, ...hilosActuales]);
    }
  };

  return (
    <div className="foro-pagina d-flex flex-column min-vh-100">
      <AppNavbar />

      <main className="container my-5 flex-grow-1" style={{ maxWidth: "1100px" }}>
        <ForoHeader onCrearHilo={() => setMostrarModal(true)} />

        <FiltrosForo
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          categoria={categoria}
          setCategoria={setCategoria}
        />

        <section className="mb-5">
          {hilosFiltrados.length > 0 ? (
            hilosFiltrados.map((hilo) => (
              <HiloCard key={hilo.id_foro || hilo.id} hilo={hilo} />
            ))
          ) : (
            <div className="foro-card text-center py-5">
              <div className="card-body">
                <h3 className="h5 fw-bold mb-2">No se encontraron hilos</h3>
                <p className="text-muted mb-0">Intenta cambiar la búsqueda o la categoría.</p>
              </div>
            </div>
          )}
        </section>

        {mostrarModal && (
          <CrearHiloModal
            onCerrar={() => setMostrarModal(false)}
            onCrearHilo={agregarNuevoHilo}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Foro;