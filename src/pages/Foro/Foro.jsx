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

        setHilos(respuesta.datos);
      } catch (error) {
        console.error("Error al cargar los hilos:", error);
      }
    };

    cargarHilos();
  }, []);

  const hilosFiltrados = hilos.filter((hilo) => {
    const coincideBusqueda =
      hilo.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      hilo.contenido.toLowerCase().includes(busqueda.toLowerCase());

    const coincideCategoria =
      categoria === "todas" ||
      hilo.categoria.toLowerCase() === categoria.toLowerCase();

    return coincideBusqueda && coincideCategoria;
  });

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
            hilosFiltrados.map((hilo) => <HiloCard key={hilo.id} hilo={hilo} />)
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
            onCrearHilo={async (nuevoHilo) => {
              try {
                const respuesta = await foroService.crear(nuevoHilo);

                const hiloCreado =
                  respuesta.dato || respuesta.data || respuesta;

                setHilos((hilosActuales) => [hiloCreado, ...hilosActuales]);

                setMostrarModal(false);
              } catch (error) {
                console.error("Error al crear el hilo:", error);
              }
            }}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Foro;
