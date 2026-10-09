import { useEffect, useState } from "react";

import ForoHeader from "../../components/foro/ForoHeader";
import FiltrosForo from "../../components/foro/FiltrosForo";
import HiloCard from "../../components/foro/HiloCard";
import CrearHiloModal from "../../components/foro/CrearHiloModal";

import { AppNavbar } from "../../components/layout/AppNavbar";
import { Footer } from "../../components/layout/Footer";

import { foroService } from "../../services/foroService.js";

import "./foro.css";

function Foro() {
  const [hilos, setHilos] = useState([]);

  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("todas");
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    const cargarHilos = async () => {
      try {
        const respuesta = await foroService.listar();
        // Aseguramos que sea un arreglo
        setHilos(respuesta.datos || respuesta.data || []);
      } catch (error) {
        console.error("Error al cargar los hilos:", error);
      }
    };

    cargarHilos();
  }, []);

  const hilosFiltrados = hilos.filter((hilo) => {
    // Lectura segura con Optional Chaining (?.) y fallback a string vacío
    const titulo = hilo?.titulo?.toLowerCase() || "";
    const contenido = hilo?.contenido?.toLowerCase() || "";
    
    // Mapeo seguro de la categoría desde Laravel
    const nombreCategoria = (
      hilo?.categoriaForo?.nombre_categoria || 
      hilo?.categoria || 
      ""
    ).toLowerCase();

    const textoBusqueda = busqueda.toLowerCase();

    const coincideBusqueda =
      titulo.includes(textoBusqueda) || contenido.includes(textoBusqueda);

    const coincideCategoria =
      categoria === "todas" ||
      nombreCategoria.includes(categoria.toLowerCase());

    return coincideBusqueda && coincideCategoria;
  });

  // Función para incorporar el hilo creado por CrearHiloModal sin re-hacer la petición
  const agregarNuevoHilo = (hiloCreado) => {
    if (hiloCreado) {
      setHilos((hilosActuales) => [hiloCreado, ...hilosActuales]);
    }
  };

  return (
    <div className="foro-pagina">
      <AppNavbar />

      <main className="foro">
        <ForoHeader onCrearHilo={() => setMostrarModal(true)} />

        <FiltrosForo
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          categoria={categoria}
          setCategoria={setCategoria}
        />

        <section className="foro-lista">
          {hilosFiltrados.length > 0 ? (
            hilosFiltrados.map((hilo) => (
              <HiloCard key={hilo.id_foro || hilo.id} hilo={hilo} />
            ))
          ) : (
            <div className="foro-sin-resultados">
              <h3>No se encontraron hilos</h3>
              <p>Intenta cambiar la búsqueda o la categoría.</p>
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