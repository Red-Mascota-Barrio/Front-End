import { useState } from "react";

import ForoHeader from "../../components/foro/ForoHeader";
import FiltrosForo from "../../components/foro/FiltrosForo";
import HiloCard from "../../components/foro/HiloCard";
import CrearHiloModal from "../../components/foro/CrearHiloModal";

import { AppNavbar } from "../../components/layout/AppNavbar";
import { Footer } from "../../components/layout/Footer";

import "./foro.css";

const hilosIniciales = [
  {
    id: 1,
    titulo: "¿Cómo puedo mejorar mis hábitos de estudio?",
    contenido:
      "Me gustaría conocer algunos consejos para organizar mejor mi tiempo de estudio.",
    categoria: "Estudio",
    autor: "Usuario 1",
    respuestas: 8,
    visitas: 120,
    destacado: true,
  },
  {
    id: 2,
    titulo: "Consejos para comenzar un proyecto",
    contenido:
      "Estoy empezando un proyecto personal y me gustaría conocer sus recomendaciones.",
    categoria: "Proyectos",
    autor: "Usuario 2",
    respuestas: 5,
    visitas: 87,
    destacado: false,
  },
  {
    id: 3,
    titulo: "¿Qué herramientas utilizan para organizarse?",
    contenido:
      "Quiero conocer algunas herramientas que les hayan servido para organizar sus actividades.",
    categoria: "General",
    autor: "Usuario 3",
    respuestas: 12,
    visitas: 245,
    destacado: false,
  },
];

function Foro() {
  const [hilos, setHilos] = useState(() => {
    const hilosGuardados = localStorage.getItem("hilosForo");

    if (hilosGuardados) {
      return JSON.parse(hilosGuardados);
    }

    localStorage.setItem(
      "hilosForo",
      JSON.stringify(hilosIniciales)
    );

    return hilosIniciales;
  });

  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("todas");
  const [mostrarModal, setMostrarModal] = useState(false);

  const hilosFiltrados = hilos.filter((hilo) => {
    const coincideBusqueda =
      hilo.titulo
        .toLowerCase()
        .includes(busqueda.toLowerCase()) ||
      hilo.contenido
        .toLowerCase()
        .includes(busqueda.toLowerCase());

    const coincideCategoria =
      categoria === "todas" ||
      hilo.categoria.toLowerCase() ===
        categoria.toLowerCase();

    return coincideBusqueda && coincideCategoria;
  });

  return (
    <div className="foro-pagina">
      <AppNavbar />

      <main className="foro">
        <ForoHeader
          onCrearHilo={() => setMostrarModal(true)}
        />

        <FiltrosForo
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          categoria={categoria}
          setCategoria={setCategoria}
        />

        <section className="foro-lista">
          {hilosFiltrados.length > 0 ? (
            hilosFiltrados.map((hilo) => (
              <HiloCard
                key={hilo.id}
                hilo={hilo}
              />
            ))
          ) : (
            <div className="foro-sin-resultados">
              <h3>No se encontraron hilos</h3>
              <p>
                Intenta cambiar la búsqueda o la categoría.
              </p>
            </div>
          )}
        </section>

        {mostrarModal && (
          <CrearHiloModal
            onCerrar={() => setMostrarModal(false)}
            onCrearHilo={(nuevoHilo) => {
              setHilos((hilosActuales) => {
                const nuevosHilos = [
                  nuevoHilo,
                  ...hilosActuales,
                ];

                localStorage.setItem(
                  "hilosForo",
                  JSON.stringify(nuevosHilos)
                );

                return nuevosHilos;
              });
            }}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Foro;
