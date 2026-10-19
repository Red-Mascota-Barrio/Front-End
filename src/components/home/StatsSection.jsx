import { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

const ITEMS = [
  { clave: 'mascotas', etiqueta: 'Mascotas registradas', icono: 'bi-heart' },
  { clave: 'adopciones', etiqueta: 'Adopciones exitosas', icono: 'bi-house-heart' },
  { clave: 'usuarios', etiqueta: 'Usuarios en la red', icono: 'bi-people' },
];

// Cuenta desde 0 hasta el valor real con una animación suave
const useContador = (objetivo, duracion = 1200) => {
  const [valor, setValor] = useState(0);

  useEffect(() => {
    const n = Number(objetivo);
    if (objetivo === null || !Number.isFinite(n)) return undefined;

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

const ItemStat = ({ icono, etiqueta, valor }) => {
  const numero = Number(valor);
  const esNumero = valor !== null && valor !== undefined && valor !== '' && Number.isFinite(numero);
  const animado = useContador(esNumero ? numero : null);

  return (
    <div className="stat-banner-item">
      <div className="stat-banner-icono"><i className={`bi ${icono}`} aria-hidden="true" /></div>
      <div className="numero">{esNumero ? animado.toLocaleString('es-CO') : (valor ?? '—')}</div>
      <div className="etiqueta">{etiqueta}</div>
    </div>
  );
};

// Las cifras generales ya las carga AuthContext (GET /estadisticas); aquí solo se muestran
export const StatsSection = () => {
  const { statsGenerales, cargandoStats } = useAuth();

  return (
    <section id="estadisticas" className="stat-banner-wrap">
      <Container>
        <div className="stat-banner">
          <Row className="g-4">
            {ITEMS.map(({ clave, etiqueta, icono }) => (
              <Col xs={12} sm={4} key={clave}>
                <ItemStat
                  icono={icono}
                  etiqueta={etiqueta}
                  valor={cargandoStats ? '…' : statsGenerales?.[clave]}
                />
              </Col>
            ))}
          </Row>
        </div>
      </Container>
    </section>
  );
};
