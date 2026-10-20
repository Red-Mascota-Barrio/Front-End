import {
  Alert, Button, Card, Form, InputGroup, Modal, Pagination, Spinner,
} from 'react-bootstrap';
import { AdminIcon } from './AdminIcon';
import { formatoNumero } from '../../utils/admin';

/* ============================================================
   Piezas reutilizables del panel (React-Bootstrap)
   ============================================================ */

export const PageHeader = ({ titulo, subtitulo, children }) => (
  <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
    <div>
      <h1 className="h3 fw-bold mb-1 adm-titulo">{titulo}</h1>
      {subtitulo && <p className="text-secondary small mb-0">{subtitulo}</p>}
    </div>
    {children && <div className="d-flex flex-wrap align-items-center gap-2">{children}</div>}
  </div>
);

export const StatCard = ({ icono, numero, label, alerta = false, cargando = false }) => {
  const v = alerta ? 'danger' : 'success';
  return (
    <Card className={`h-100 border-0 shadow-sm ${alerta ? 'border-start border-4 border-danger' : ''}`}>
      <Card.Body className="d-flex align-items-center gap-3">
        <div className={`adm-stat-icono rounded-3 bg-${v}-subtle text-${v}-emphasis`}>
          <AdminIcon nombre={icono} size={24} />
        </div>
        <div>
          <div className={`fs-3 fw-bold lh-1 ${alerta ? 'text-danger' : ''}`}>
            {cargando ? <Spinner animation="border" size="sm" /> : formatoNumero(numero)}
          </div>
          <div className="small text-secondary mt-1">{label}</div>
        </div>
      </Card.Body>
    </Card>
  );
};

// Badge suave de Bootstrap: variante = success | danger | warning | primary | secondary | info
export const Badge = ({ variante = 'secondary', children, className = '' }) => (
  <span
    className={`badge rounded-pill fw-semibold bg-${variante}-subtle text-${variante}-emphasis border border-${variante}-subtle ${className}`}
  >
    {children}
  </span>
);

export const Toolbar = ({ busqueda, onBusqueda, placeholder, children }) => (
  <div className="d-flex flex-wrap gap-2 mb-3">
    <InputGroup className="flex-grow-1" style={{ minWidth: 220, maxWidth: 520 }}>
      <InputGroup.Text className="bg-white">
        <AdminIcon nombre="lupa" />
      </InputGroup.Text>
      <Form.Control
        type="search"
        value={busqueda}
        onChange={(e) => onBusqueda(e.target.value)}
        placeholder={placeholder}
        aria-label="Buscar"
      />
    </InputGroup>
    {children}
  </div>
);

export const SelectFiltro = ({ value, onChange, opciones, label }) => (
  <Form.Select className="w-auto" value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
    {opciones.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </Form.Select>
);

// Construye la lista de páginas con "…" (1 2 3 … 53)
const paginasVisibles = (actual, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, actual - 1, actual, actual + 1]);
  if (actual <= 3) [2, 3, 4].forEach((n) => set.add(n));
  if (actual >= total - 2) [total - 1, total - 2, total - 3].forEach((n) => set.add(n));
  const nums = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const salida = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) salida.push('…' + n);
    salida.push(n);
  });
  return salida;
};

// Tarjeta contenedora de las tablas
export const TablaCard = ({ children }) => (
  <Card className="border-0 shadow-sm overflow-hidden">{children}</Card>
);

export const TablaFooter = ({ mostrando, total, nombre, pagina, totalPaginas, onPagina }) => (
  <Card.Footer className="bg-white d-flex flex-wrap justify-content-between align-items-center gap-2 py-3">
    <span className="small text-secondary">
      Mostrando <strong>{mostrando}</strong> de {formatoNumero(total)} {nombre}
    </span>
    {totalPaginas > 1 && (
      <Pagination size="sm" className="mb-0 adm-paginacion">
        <Pagination.Prev disabled={pagina === 1} onClick={() => onPagina(pagina - 1)} />
        {paginasVisibles(pagina, totalPaginas).map((p) =>
          typeof p === 'string' ? (
            <Pagination.Ellipsis key={p} disabled />
          ) : (
            <Pagination.Item key={p} active={p === pagina} onClick={() => onPagina(p)}>
              {p}
            </Pagination.Item>
          ),
        )}
        <Pagination.Next disabled={pagina === totalPaginas} onClick={() => onPagina(pagina + 1)} />
      </Pagination>
    )}
  </Card.Footer>
);

// `icono`: nombre de Bootstrap Icons (search, people, calendar-event…)
export const EstadoVacio = ({ icono = 'search', titulo, sub }) => (
  <div className="text-center py-5 px-3 text-secondary">
    <div className="display-6 mb-2 text-success-emphasis"><AdminIcon nombre={icono} /></div>
    <div className="fs-5 fw-bold text-body">{titulo}</div>
    {sub && <div className="small">{sub}</div>}
  </div>
);

export const Cargando = ({ texto = 'Cargando…' }) => (
  <div className="text-center py-5 text-secondary">
    <Spinner animation="border" variant="success" className="mb-2" />
    <div className="small">{texto}</div>
  </div>
);

export const Aviso = ({ tipo = 'advertencia', children }) => (
  <Alert variant={tipo === 'error' ? 'danger' : 'warning'} className="d-flex gap-2 align-items-start">
    <AdminIcon nombre={tipo === 'error' ? 'alerta' : 'info'} className="mt-1" />
    <div>{children}</div>
  </Alert>
);

// Modal de React-Bootstrap; cierra con Escape o clic fuera
export const AdminModal = ({ abierto, titulo, onCerrar, children, size }) => (
  <Modal show={abierto} onHide={onCerrar} centered size={size} scrollable>
    <Modal.Header closeButton>
      <Modal.Title as="h5" className="fw-bold">{titulo}</Modal.Title>
    </Modal.Header>
    <Modal.Body>{children}</Modal.Body>
  </Modal>
);

// Fila de botones al final de un modal
export const ModalAcciones = ({ children }) => (
  <div className="d-flex justify-content-end gap-2 pt-3 mt-3 border-top">{children}</div>
);

// Botón pequeño de icono para las acciones de una fila
export const BotonAccion = ({ icono, titulo, peligro = false, ...props }) => (
  <Button
    size="sm"
    variant={peligro ? 'outline-danger' : 'outline-secondary'}
    title={titulo}
    aria-label={titulo}
    {...props}
  >
    <AdminIcon nombre={icono} />
  </Button>
);
