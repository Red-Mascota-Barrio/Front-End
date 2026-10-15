import { useState, useMemo } from "react";

import ForoHeader from "../../components/foro/ForoHeader";
import FiltrosForo from "../../components/foro/FiltrosForo";
import HiloCard from "../../components/foro/HiloCard";
import CrearHiloModal from "../../components/foro/CrearHiloModal";

import { AppNavbar } from "../../components/layout/AppNavbar";
import { Footer } from "../../components/layout/Footer";

import { foroService } from "../../services/foroService.js";

import "./foro.css";

export const Foro = () => {
  const [hilos, setHilos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("hilosForo")) || [];
    } catch {
      return [];
    }
  });

  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("todas");
  const [mostrarModal, setMostrarModal] = useState(false);

  const hilosFiltrados = useMemo(
    () =>
      hilos.filter((hilo) => {
        const q = busqueda.toLowerCase();
        const coincideBusqueda =
          (hilo.titulo ?? "").toLowerCase().includes(q) ||
          (hilo.contenido ?? "").toLowerCase().includes(q);
        const coincideCategoria =
          categoria === "todas" ||
          (hilo.categoria ?? "").toLowerCase() === categoria.toLowerCase();
        return coincideBusqueda && coincideCategoria;
      }),
    [hilos, busqueda, categoria]
  );

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