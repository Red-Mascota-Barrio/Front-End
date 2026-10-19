import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import Swal from "sweetalert2";

import ForoHeader from "../../components/foro/ForoHeader";
import FiltrosForo from "../../components/foro/FiltrosForo";
import HiloCard from "../../components/foro/HiloCard";
import CrearHiloModal from "../../components/foro/CrearHiloModal";
import { AppNavbar } from "../../components/layout/AppNavbar";
import { Footer } from "../../components/layout/Footer";

import { foroService } from "../../services/foroService.js";
import { useAuth } from "../../context/AuthContext";
import { normalizar } from "../../utils/admin";
import { idHilo, idCategoriaHilo, especieDeCategoria, categoriasDesdeHilos } from "../../utils/foro";
import { Icono, IconoEspecie } from "../../components/common/Icono";
import "../../styles/foro.css";

const REGLAS = [
  "Sé respetuoso con todos los miembros",
  "No publiques información personal de terceros",
  "Nada de venta de animales",
  "Reporta el contenido inapropiado",
];

function Foro() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [hilos, setHilos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("todas");
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    let activo = true;
    foroService
      .listar()
      .then((r) => activo && setHilos(r.datos || r.data || []))
      .catch((err) => {
        console.error("Error al cargar los hilos:", err);
        if (activo) setError("No se pudieron cargar los hilos del foro.");
      })
      .finally(() => activo && setCargando(false));

    return () => { activo = false; };
  }, []);

  // El back no tiene GET /categorias: se arman con las que traen los hilos (relación categoria_foro)
  const categorias = useMemo(() => categoriasDesdeHilos(hilos), [hilos]);

  // Filtra por texto y por ID de categoría (antes comparaba nombres y fallaba con las categorías reales)
  const hilosFiltrados = useMemo(() => {
    const q = normalizar(busqueda.trim());
    return hilos.filter((h) => {
      const coincideTexto = normalizar(`${h?.titulo ?? ""} ${h?.contenido ?? ""}`).includes(q);
      const coincideCategoria = categoria === "todas" || idCategoriaHilo(h) === Number(categoria);
      return coincideTexto && coincideCategoria;
    });
  }, [hilos, busqueda, categoria]);

  const masActivos = useMemo(
    () => [...hilos].sort((a, b) => (b.numero_comentarios ?? 0) - (a.numero_comentarios ?? 0)).slice(0, 4),
    [hilos],
  );
  const totalRespuestas = hilos.reduce((s, h) => s + (Number(h.numero_comentarios) || 0), 0);

  const abrirModal = () => {
    if (!token) {
      Swal.fire({
        icon: "info",
        title: "Inicia sesión",
        text: "Necesitas una cuenta para publicar en el foro.",
        confirmButtonText: "Ir a iniciar sesión",
        showCancelButton: true,
        cancelButtonText: "Ahora no",
      }).then((r) => r.isConfirmed && navigate("/login"));
      return;
    }
    setMostrarModal(true);
  };

  // Incorpora el hilo creado sin volver a pedir la lista
  const agregarNuevoHilo = (hiloCreado) => {
    if (hiloCreado) setHilos((actuales) => [{ ...hiloCreado, usuario: hiloCreado.usuario ?? user }, ...actuales]);
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <AppNavbar />

      <main className="flex-grow-1">
        <ForoHeader onCrearHilo={abrirModal} />

        <Container className="pagina-solapada">
          <Row className="g-4">
            {/* HILOS */}
            <Col lg={8}>
              <div className="tarjeta-lateral p-3 p-md-4">
                <FiltrosForo
                  busqueda={busqueda}
                  setBusqueda={setBusqueda}
                  categoria={categoria}
                  setCategoria={setCategoria}
                  categorias={categorias}
                  total={hilos.length}
                />

                {error && <Alert variant="danger"><Icono nombre="exclamation-circle" /> {error}</Alert>}

                {cargando ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" role="status" />
                    <p className="mt-3 text-muted">Cargando hilos…</p>
                  </div>
                ) : hilosFiltrados.length > 0 ? (
                  hilosFiltrados.map((hilo) => <HiloCard key={idHilo(hilo)} hilo={hilo} categorias={categorias} />)
                ) : error ? null : (
                  <div className="estado-vacio">
                    <div className="estado-vacio-icono"><Icono nombre="chat-square-text" /></div>
                    <h3>No se encontraron hilos</h3>
                    <p>Intenta cambiar la búsqueda o la categoría, o abre un tema nuevo.</p>
                  </div>
                )}
              </div>
            </Col>

            {/* SIDEBAR */}
            <Col lg={4}>
              <div className="sticky-lateral">
                <div className="tarjeta-lateral">
                  <div className="tarjeta-lateral-titulo"><Icono nombre="bar-chart" /> Estadísticas del foro</div>
                  <div className="mini-stats">
                    <div className="mini-stat">
                      <div className="mini-stat-num">{hilos.length}</div>
                      <div className="mini-stat-lbl">Hilos</div>
                    </div>
                    <div className="mini-stat">
                      <div className="mini-stat-num">{totalRespuestas}</div>
                      <div className="mini-stat-lbl">Respuestas</div>
                    </div>
                  </div>
                </div>

                {masActivos.length > 0 && (
                  <div className="tarjeta-lateral">
                    <div className="tarjeta-lateral-titulo"><Icono nombre="fire" /> Hilos más activos</div>
                    {masActivos.map((h) => {
                      const cat = categorias.find((c) => Number(c.id_categoria) === idCategoriaHilo(h));
                      return (
                        <Link key={idHilo(h)} to={`/foro/${idHilo(h)}`} className="foro-sidebar-item">
                          <span className="foro-sidebar-item-icono"><IconoEspecie especie={especieDeCategoria(cat)} /></span>
                          <div>
                            <div className="foro-sidebar-item-titulo">{h.titulo}</div>
                            <div className="foro-sidebar-item-meta">{h.numero_comentarios ?? 0} respuestas</div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}

                <div className="tarjeta-lateral">
                  <div className="tarjeta-lateral-titulo"><Icono nombre="list-check" /> Reglas del foro</div>
                  <ul className="foro-reglas">
                    {REGLAS.map((r) => <li key={r}>{r}</li>)}
                  </ul>
                </div>
              </div>
            </Col>
          </Row>
        </Container>

        {mostrarModal && (
          <CrearHiloModal
            categorias={categorias}
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
