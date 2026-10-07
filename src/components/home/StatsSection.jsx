import { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaPaw, FaHeart, FaUsers } from 'react-icons/fa';
import { statsService } from '../../services/statsService';
import '../../assets/home.css';

const ITEMS = [
  { clave: 'mascotas', etiqueta: 'Mascotas registradas', Icono: FaPaw },
  { clave: 'adopciones', etiqueta: 'Adopciones exitosas', Icono: FaHeart },
  { clave: 'usuarios', etiqueta: 'Usuarios en la red', Icono: FaUsers },
];

// Cuenta desde 0 hasta el valor real con una animación suave
const useContador = (objetivo, duracion = 1200) => {
  const [valor, setValor] = useState(0);

  useEffect(() => {
    const n = Number(objetivo);
    if (!Number.isFinite(n)) return undefined;

    let inicio = null;
    let frame;
    const paso = (t) => {
      if (inicio === null) inicio = t;
      const progreso = Math.min((t - inicio) / duracion, 1);
      setValor(Math.round(n * (1 - Math.pow(1 - progreso, 3))));
      if (progreso < 1) frame = requestAnimationFrame(paso);
    };
    frame = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(frame);
  }, [objetivo, duracion]);

  return valor;
};

const TarjetaStat = ({ Icono, etiqueta, valor }) => {
  const numero = Number(valor);
  const esNumero = valor !== null && valor !== undefined && Number.isFinite(numero);
  const animado = useContador(esNumero ? numero : null);

  return (
    <div className="inicio-card">
      <div className="inicio-icono-circulo"><Icono /></div>
      <div className="inicio-stat-numero">{esNumero ? animado : (valor ?? '—')}</div>
      <div className="inicio-stat-etiqueta">{etiqueta}</div>
    </div>
  );
};

export const StatsSection = () => {
  const [stats, setStats] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    statsService
      .obtenerGenerales() // <-- Corrección: Ahora llama al método renombrado
      .then(setStats)
      .catch((error) => console.error('No se pudieron cargar las estadísticas:', error))
      .finally(() => setCargando(false));
  }, []);

  return (
    <section id="estadisticas" className="inicio-seccion">
      <Container>
        <h2 className="inicio-titulo">Nuestra comunidad en cifras</h2>
        <Row className="g-4">
          {ITEMS.map(({ clave, etiqueta, Icono }) => (
            <Col md={4} key={clave}>
              <TarjetaStat
                Icono={Icono}
                etiqueta={etiqueta}
                // Mientras carga la petición, mostramos los puntos suspensivos
                valor={cargando ? '...' : stats?.[clave]}
              />
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};